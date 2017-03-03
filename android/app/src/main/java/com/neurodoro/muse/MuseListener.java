package com.neurodoro.muse;

import android.support.annotation.Nullable;
import android.util.Log;

import com.choosemuse.libmuse.Eeg;
import com.choosemuse.libmuse.Muse;
import com.choosemuse.libmuse.MuseArtifactPacket;
import com.choosemuse.libmuse.MuseDataListener;
import com.choosemuse.libmuse.MuseDataPacket;
import com.choosemuse.libmuse.MuseDataPacketType;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.neurodoro.MainApplication;
import com.neurodoro.signal.CircularBuffer;
import com.neurodoro.signal.FFT;
import com.neurodoro.signal.Filter;
import com.neurodoro.signal.DynamicSeries;
import com.neurodoro.signal.NoiseDetector;
import com.neurodoro.signal.PSDBuffer;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import static android.R.attr.data;

/**
 * Streams data from Muses and performs preprocessing functions
 */

public class  MuseListener extends ReactContextBaseJavaModule {

    // ----------------------------------------------------------
    // Variables

    public DynamicSeries dataSeries;
    String TAG = "EEGGraph";
    public int BUFFER_LENGTH;
    Thread dataThread;
    EEGDataSource data;
    public DataListener dataListener;
    public CircularBuffer eegBuffer;
    public double[] newData = new double[4];
    public double[][] latestSamples;

    // Filter variables
    public int filterFreq;
    public Filter bandPassFilter;
    public double[][] bandPassFiltState;
    public double[] filtResult;

    // grab reference to global Muse
    MainApplication appState;

    // ---------------------------------------------------------
    // Constructor
    public MuseListener(ReactApplicationContext reactContext) {
        super(reactContext);
        appState = ((MainApplication)reactContext.getApplicationContext());
    }

    // ---------------------------------------------------------
    // React Native Module methods
    // Required by ReactContextBaseJavaModule
    @Override
    public String getName() {
        return "MuseListener";
    }

    // Called to emit events to event listeners in JS
    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    // ---------------------------------------------------------
    // Bridged methods

    @ReactMethod
    public void initListener() {
        Log.w("Listener", "Init Listener Called");

        if (appState.connectedMuse.isLowEnergy()) {
            filterFreq = 256;
        } else { filterFreq = 220; }
        BUFFER_LENGTH = filterFreq * 2;
        eegBuffer = new CircularBuffer(BUFFER_LENGTH, 4);
        data = new EEGDataSource();
        dataSeries = new DynamicSeries("EEG data");
        bandPassFilter = new Filter(filterFreq, "bandpass", 4, 1, 50);
        bandPassFiltState = new double[4][bandPassFilter.getNB()];
    }

    @ReactMethod
    public void startListening() {
        Log.w("Listener", "Start Listening Called");

        // Register a listener to receive connection state changes.
        dataListener = new DataListener();
        appState.connectedMuse.registerDataListener(dataListener, MuseDataPacketType.EEG);

        startDataThread();
    }

    @ReactMethod
    public void stopListening() {
        Log.w("Listener", "Stop Listening Called");

        stopThreads();
    }

    // ---------------------------------------------------------
    // Thread management functions

    public void startDataThread() {
        dataThread = new Thread (data);
        dataThread.start();
    }

    public void stopThreads(){
        data.stopThread();
        if (dataListener != null) {
            appState.connectedMuse.unregisterDataListener(dataListener, MuseDataPacketType.EEG);
        }
    }

    // --------------------------------------------------------------
    // Listeners

    // Listener that receives incoming data from the Muse. Will run receiveMuseDataPacket
    // Will call receiveMuseDataPacket as data comes in around 220hz (250hz for Muse 2016)
    class DataListener extends MuseDataListener {
        Boolean isLowEnergy;

        DataListener() {
            Log.w("EEG", "Created Data Listener");
            isLowEnergy = appState.connectedMuse.isLowEnergy();
        }

        @Override
        public void receiveMuseDataPacket(final MuseDataPacket p, final Muse muse) {
            getEegChannelValues(newData, p);
            // Filter new raw sample
            bandPassFiltState = bandPassFilter.transform(newData, bandPassFiltState);
            filtResult = bandPassFilter.extractFilteredSamples(bandPassFiltState);

            eegBuffer.update(filtResult);
        }

        private void getEegChannelValues(double[] buffer, MuseDataPacket p) {
            buffer[0] = p.getEegChannelValue(Eeg.EEG1);
            buffer[1] = p.getEegChannelValue(Eeg.EEG2);
            buffer[2] = p.getEegChannelValue(Eeg.EEG3);
            buffer[3] = p.getEegChannelValue(Eeg.EEG4);
        }

        @Override
        public void receiveMuseArtifactPacket(final MuseArtifactPacket p, final Muse muse) {
            // Does nothing for now
        }
    }

    // --------------------------------------------------------------
    // Runnables

    // Updates dataSeries, performs data processing
    public final class EEGDataSource implements Runnable {
        private boolean keepRunning;
        private NoiseDetector noiseDetector;
        private boolean[] noiseArray;
        int fftLength = BUFFER_LENGTH; // Same as windowlength for now
        FFT fft = new FFT(BUFFER_LENGTH, fftLength, filterFreq);
        double[] f = fft.getFreqBins();
        double[][] rawPSD;
        int fftBufferLength = 20;
        int nbBins = f.length;
        PSDBuffer psdBuffer = new PSDBuffer(fftBufferLength, nbBins);
        double[] logpower = new double[nbBins];
        public double[] smoothLogPower = new double[nbBins];
        public FileWriter fileWriter;

        // File writing stuff
        int fileNum = 1;
        File file;

        // Choosing these step sizes arbitrarily based on how they look
        public EEGDataSource() {
            createFile();
            noiseDetector = new NoiseDetector(600.0);
        }

        @Override
        public void run() {
            try {
                keepRunning = true;
                while (keepRunning) {
                    if (eegBuffer.getPts() >= BUFFER_LENGTH) {

                        latestSamples = eegBuffer.extractTransposed(BUFFER_LENGTH);
                        noiseArray = noiseDetector.detectArtefact(latestSamples);

                        if (isNoiseFree(noiseArray)) {
                            Log.w("Listener", "Clean array!");

                            // Compute rawPSD for each channel
                            for (int i = 0; i < 4; i++) {
                                // TODO: normalize PSD
                                rawPSD[i] = fft.computePSD(latestSamples[i]);
                            }

                            // Append data to a big double array
                        }

                        eegBuffer.resetPts();
                    }
                }
            } catch (Exception e) {}
        }

        public boolean isNoiseFree(boolean[] array)
        {
            for(int i = 0; i < array.length; i++) if(array[i]) {
                Log.w("Listener", "Noise detected in electrode " + (i + 1) );
                return false;
            }
            return true;
        }

        public void createFile() {
            try {
                file = new File("/MuseData" + fileNum + ".csv");
                if (!file.exists()) {
                    file.createNewFile();
                    Log.w("Listener", "Created new file");
                    fileWriter = new FileWriter(file.getAbsoluteFile());
                    return;
                } else {
                    Log.w("Listener", "File name taken, trying again");
                    fileNum++;
                    createFile();
                }
            } catch (IOException e) {}
        }

        public void writeFile() {
            // write file to a csv
        }


        public void stopThread() {
            keepRunning = false;
            createFile();
            writeFile();
        }
    }
}


