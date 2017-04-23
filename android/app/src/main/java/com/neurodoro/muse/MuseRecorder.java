package com.neurodoro.muse;

import android.support.annotation.Nullable;
import android.util.Log;

import com.choosemuse.libmuse.Eeg;
import com.choosemuse.libmuse.Muse;
import com.choosemuse.libmuse.MuseArtifactPacket;
import com.choosemuse.libmuse.MuseDataListener;
import com.choosemuse.libmuse.MuseDataPacket;
import com.choosemuse.libmuse.MuseDataPacketType;
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
import com.neurodoro.signal.PSDBuffer2D;
import com.neurodoro.muse.MuseDataSource;

/**
 * Streams data from Muses and performs preprocessing functions
 */

public class MuseRecorder extends ReactContextBaseJavaModule {

    // ----------------------------------------------------------
    // Variables

    public DynamicSeries dataSeries;
    String TAG = "EEGGraph";
    public int BUFFER_LENGTH;
    Thread dataThread;
    MuseDataSource data;
    public DataListener dataListener;
    public CircularBuffer eegBuffer;
    public double[] newData = new double[4];
    public String userName = "";
    public int fileNum = 0;

    // Filter variables
    public int filterFreq;
    public Filter bandPassFilter;
    public double[][] bandPassFiltState;
    public double[] filtResult = new double[4];

    // Bridged props
    public String recorderDataType = "DENOISED_PSD";

    // Reference to global Muse
    MainApplication appState;

    // ---------------------------------------------------------
    // Constructor
    public MuseRecorder(ReactApplicationContext reactContext) {
        super(reactContext);
        appState = ((MainApplication)reactContext.getApplicationContext());
    }

    // ---------------------------------------------------------
    // React Native Module methods
    // Required by ReactContextBaseJavaModule

    @Override
    public String getName() {
        return "MuseRecorder";
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
    public void startRecording(String dataType) {
        Log.w("Listener", "Start Listening Called");
        this.recorderDataType = dataType;
        initListener();
        data.fileWriter.initFile();
        startDataThread();
    }

    @ReactMethod
    public void stopRecording() {
        Log.w("Listener", "Stop Listening Called");
        stopThreads();
        fileNum++;
    }

    @ReactMethod
    public void sendTaskInfo(int difficulty, int performance) {
        if (data.fileWriter != null) {
            data.fileWriter.updateTaskInfo(difficulty, performance);
        }
    }

    @ReactMethod
    public void setUserName(String name) {
        this.userName = name;
    }

    // ---------------------------------------------------------
    // Internal Methods

    public void initListener() {
        Log.w("Listener", "Init Listener Called");

        // Set sampling frequency based on type of Muse
        if (appState.connectedMuse.isLowEnergy()) {
            filterFreq = 256;
        } else { filterFreq = 220; }
        BUFFER_LENGTH = filterFreq;

        // Create new eegBuffer
        eegBuffer = new CircularBuffer(BUFFER_LENGTH, 4);

        // Create PSDDataSource if recorder is to record PSD data, EEGDataSource otherwise
        if (recorderDataType.contains("PSD")) {
            Log.w("Listener", "PSD datatype detected");
            data = new PSDDataSource(fileNum);
        } else {
            Log.w("Listener", "EEG datatype detected");
            data = new EEGDataSource(fileNum);

            // If data will be filtered, create filters
            if(recorderDataType.contains("FILTERED")) {
                Log.w("Listener", "Filter detected");
                bandPassFilter = new Filter(filterFreq, "bandpass", 4, 1, 50);
                bandPassFiltState = new double[4][bandPassFilter.getNB()];
            }
        }

        // Register a listener to receive connection state changes.
        dataListener = new DataListener();
        appState.connectedMuse.registerDataListener(dataListener, MuseDataPacketType.EEG);
    }

    // ---------------------------------------------------------
    // Thread management functions

    public void startDataThread() {
        dataThread = new Thread(data);
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

        DataListener() {
        }

        @Override
        public void receiveMuseDataPacket(final MuseDataPacket p, final Muse muse) {
            getEegChannelValues(newData, p);
            eegBuffer.update(newData);
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

    // Runs an FFT on data in eegBuffer when it fills up, checks for noise, and writes data to
    // csv file if it is noise-free
    public final class PSDDataSource extends MuseDataSource implements Runnable  {
        private int nbChannels = 4;
        private NoiseDetector noiseDetector;
        private boolean[] noiseArray;
        int fftLength = BUFFER_LENGTH;
        int nbFreqBins = BUFFER_LENGTH / 2;
        private FFT fft = new FFT(BUFFER_LENGTH, fftLength, filterFreq);
        int fftBufferLength = 20;
        PSDBuffer2D psdBuffer = new PSDBuffer2D(fftBufferLength, nbChannels, nbFreqBins);
        public double[][] latestSamples = new double[nbChannels][BUFFER_LENGTH];
        public double[] tempPSD = new double[nbFreqBins];
        double[][] logPSD = new double[nbChannels][nbFreqBins];
        public double[][] smoothLogPower = new double[nbChannels][nbFreqBins];


        // Setting appropriate variance for noise detector (being pretty generous)

        public PSDDataSource(int fileNum) {
            super(getCurrentActivity(), recorderDataType, fileNum, BUFFER_LENGTH / 2);
            noiseDetector = new NoiseDetector(600.0);
            fileWriter.updateUserName(userName);
        }

        @Override
        public void run() {
            try {
                keepRunning = true;
                while (keepRunning) {
                    if (eegBuffer.getPts() >= BUFFER_LENGTH) {

                        // Extract latest samples
                        latestSamples = eegBuffer.extractTransposed(BUFFER_LENGTH);

                        // Check for noise. Proceed only if it's clean
                        noiseArray = noiseDetector.detectArtefact(latestSamples);
                        if (isNoiseFree(noiseArray)) {
                           Log.w("Listener", "Clean array!");

                            // Compute average PSD for all channels in latest samples and add to
                            // PSDBuffer
                            psdBuffer.fftAndUpdate(latestSamples, fft);

                            // Compute average PSD over buffer
                            smoothLogPower = psdBuffer.mean();

                            // Add all 4 channels' smoothed PSDs to the CSV file
                            fileWriter.addPSDToFile(smoothLogPower);
                        }

                        // resets the 'points-since-dataSource-read' value
                        eegBuffer.resetPts();
                    }
                }
            } catch (Exception e) {Log.e("MuseRecorder", "Error in runnable " + e);}
        }

        public boolean isNoiseFree(boolean[] array)
        {
            for(int i = 0; i < array.length; i++) if(array[i]) {
                Log.w("Listener", "Noise detected in electrode " + (i + 1) );
                return false;
            }
            return true;
        }

        public void clearDataBuffer() {
            psdBuffer.clear();
            eegBuffer.clear();
        }

    }

    // Runs adds raw or filtered EEG to a csv as it comes in
    public final class EEGDataSource extends MuseDataSource implements Runnable {
        private int stepSize = 1;
        public double[] latestSamples;

        public EEGDataSource(int fileNum) {
            super(getCurrentActivity(), recorderDataType, fileNum);
            fileWriter.updateUserName(userName);
        }

        @Override
        public void run() {
            try {
                keepRunning = true;
                while (keepRunning) {
                    if (eegBuffer.getPts() >= stepSize) {

                        // Extract latest samples
                        latestSamples = eegBuffer.extract(1)[0];

                        if(recorderDataType.contains("FILTERED")) {
                            // Filter new raw sample
                            bandPassFiltState = bandPassFilter.transform(latestSamples,
                                    bandPassFiltState);
                            filtResult = bandPassFilter.extractFilteredSamples(bandPassFiltState);
                            // Adds datapoint from all 4 channels to csv
                            fileWriter.addEEGDataToFile(filtResult);
                        } else {

                            // Adds datapoint from all 4 channels to csv
                            fileWriter.addEEGDataToFile(latestSamples);

                        }

                        // resets the 'points-since-dataSource-read' value
                        eegBuffer.resetPts();
                    }
                }
            } catch (Exception e) {}
        }

        public void clearDataBuffer() {
            eegBuffer.clear();
        }

    }
}


