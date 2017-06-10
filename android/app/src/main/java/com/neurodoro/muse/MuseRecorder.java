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
import com.neurodoro.signal.NoiseDetector;
import com.neurodoro.signal.PSDBuffer2D;

/**
 * Streams data from Muses and performs preprocessing functions
 */

public class MuseRecorder extends ReactContextBaseJavaModule {

    // ----------------------------------------------------------
    // Variables

    Thread dataThread;
    public int samplingFreq;
    public int BUFFER_LENGTH;
    public PSDDataSource data;
    public DataListener dataListener;
    public CircularBuffer eegBuffer;
    public String userName = "";
    public int fileNum = 0;
    public EEGFileWriter fileWriter;

    // Filter variables
    public Filter bandPassFilter;
    public double[][] bandPassFiltState;

    // Bridged props
    public String recorderDataType;

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
        fileWriter.initFile();
        if(recorderDataType.contains("DENOISED_PSD")) {
            startDataThread();
        }
    }

    @ReactMethod
    public void stopRecording() {
        Log.w("Listener", "Stop Listening Called");
        if (dataListener != null) {
            appState.connectedMuse.unregisterDataListener(dataListener, MuseDataPacketType.EEG);
        }
        if(recorderDataType.contains("DENOISED_PSD")) {
            stopThread();
        }
        fileWriter.writeFile();
        fileNum++;
    }

    @ReactMethod
    public void sendTaskInfo(int difficulty, int performance) {
        if (fileWriter != null) {
            fileWriter.updateTaskInfo(difficulty, performance);
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
            samplingFreq = 256;
        } else { samplingFreq = 220; }

        // Create PSDDataSource if recorder is set to record PSD data.
        // This will create a different type of PSDDataSource
        if (recorderDataType.contains("PSD")) {
            Log.w("Listener", "PSD datatype detected");
            eegBuffer = new CircularBuffer(samplingFreq, 4);
            data = new PSDDataSource();
        } else {
            Log.w("Listener", "EEG datatype detected");
            fileWriter = new EEGFileWriter(getCurrentActivity(), recorderDataType, fileNum);
            fileWriter.updateUserName(userName);

            // If data will be filtered, create filters
            if(recorderDataType.contains("FILTERED")) {
                Log.w("Listener", "Filter detected");
                bandPassFilter = new Filter(samplingFreq, "bandpass", 4, 1, 50);
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

    public void stopThread(){
        if(data != null) {
            data.stopThread();
        }
    }

    // --------------------------------------------------------------
    // Listeners

    // Listener that receives incoming data from the Muse. Will run receiveMuseDataPacket
    // Will call receiveMuseDataPacket as data comes in around 220hz (250hz for Muse 2016)
    private final class DataListener extends MuseDataListener {
        private double[] newData;

        // Filter variables
        public boolean filterOn = false;
        public Filter bandstopFilter;
        public double[][] bandstopFiltState;

        DataListener() {
            if (appState.connectedMuse.isLowEnergy()) {
                filterOn = true;
                bandstopFilter = new Filter(256, "bandstop", 5, 55, 65);
                bandstopFiltState = new double[4][bandstopFilter.getNB()];
            }
            newData = new double[4];
        }

        @Override
        public void receiveMuseDataPacket(final MuseDataPacket p, final Muse muse) {
            getEegChannelValues(newData, p);

            // BandStop filter for 2016 Muses
            if(filterOn) {
                bandstopFiltState = bandstopFilter.transform(newData, bandstopFiltState);
                newData = bandstopFilter.extractFilteredSamples(bandstopFiltState);
            }

            // Optional filter for filtered data
            if(recorderDataType.contains("FILTERED")) {
                bandPassFiltState = bandPassFilter.transform(newData, bandPassFiltState);
                newData = bandPassFilter.extractFilteredSamples(bandPassFiltState);
            }

            if(recorderDataType.contains("DENOISED_PSD")) {
                eegBuffer.update(newData);
            } else {
                fileWriter.addEEGDataToFile(newData);
            }
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
    public final class PSDDataSource implements Runnable  {
        private int nbChannels = 4;
        private boolean keepRunning;
        private NoiseDetector noiseDetector;
        private boolean[] noiseArray;
        int inputLength = samplingFreq * 1; // 1s second samples
        int fftLength = 256;
        private FFT fft = new FFT(inputLength, fftLength, samplingFreq);
        int fftBufferLength = 20;
        int nbFreqBins = fft.getFreqBins().length;
        PSDBuffer2D psdBuffer = new PSDBuffer2D(fftBufferLength, nbChannels, nbFreqBins);
        public double[][] latestSamples = new double[nbChannels][inputLength];
        public double[][] smoothLogPower = new double[nbChannels][nbFreqBins];

        public PSDDataSource() {
            fileWriter = new EEGFileWriter(getCurrentActivity(), recorderDataType, fileNum, nbFreqBins);
            fileWriter.updateUserName(userName);
            noiseDetector = new NoiseDetector(600.0);
        }

        @Override
        public void run() {
            try {
                keepRunning = true;
                while (keepRunning) {
                    if (eegBuffer.getPts() >= inputLength) {
                        latestSamples = eegBuffer.extractTransposed(inputLength);
                        noiseArray = noiseDetector.detectArtefact(latestSamples);

                        if (isNoiseFree(noiseArray)) {
                            psdBuffer.fftAndUpdate(latestSamples, fft);
                            smoothLogPower = psdBuffer.mean();
                            fileWriter.addPSDToFile(smoothLogPower);
                        }

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

        public void stopThread() {
            keepRunning = false;
        }

        public void clearDataBuffer() {
            psdBuffer.clear();
            eegBuffer.clear();
        }
    }
}


