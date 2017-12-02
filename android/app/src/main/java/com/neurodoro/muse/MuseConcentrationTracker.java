package com.neurodoro.muse;

import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;


import com.choosemuse.libmuse.Eeg;
import com.choosemuse.libmuse.Muse;
import com.choosemuse.libmuse.MuseArtifactPacket;
import com.choosemuse.libmuse.MuseDataListener;
import com.choosemuse.libmuse.MuseDataPacket;
import com.choosemuse.libmuse.MuseDataPacketType;
import com.facebook.react.bridge.ReactApplicationContext;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.neurodoro.MainApplication;
import com.neurodoro.signal.BandPowerExtractor;
import com.neurodoro.signal.FFT;
import com.neurodoro.signal.Filter;
import com.neurodoro.signal.NoiseDetector;
import com.neurodoro.signal.PSDBuffer2D;

/**
 * Streams data from Muses and performs preprocessing functions
 */

public class MuseConcentrationTracker extends ReactContextBaseJavaModule implements BufferListener {
    private static final int NUM_CHANNELS = 4;
    private static final int FFT_LENGTH = 256;
    private static final int EPOCHS_PER_SECOND = 4;

    // ----------------------------------------------------------
    // Variables

    public NoiseDetector noiseDetector = new NoiseDetector(900);
    public ClassifierDataListener dataListener;
    public EpochBuffer eegBuffer;
    private HandlerThread dataThread;
    private Handler dataHandler;


    // Reference to global Muse
    MainApplication appState;
    private int samplingRate = 256;
    private FFT fft;
    private int nbBins;
    private BandPowerExtractor bandExtractor;
    private boolean isTracking;
    private PSDBuffer2D psdBuffer2D;

    // ---------------------------------------------------------
    // Constructor
    public MuseConcentrationTracker(ReactApplicationContext reactContext) {
        super(reactContext);
        appState = ((MainApplication)reactContext.getApplicationContext());
    }

    // ---------------------------------------------------------
    // React Native Module methods
    // Required by ReactContextBaseJavaModule

    @Override
    public String getName() {
        return "MuseConcentrationTracker";
    }

    // Called to emit events to event listeners in JS
    private void sendEvent(String eventName, int result) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, result);
    }

    // ---------------------------------------------------------
    // Bridged methods

    @ReactMethod
    public void init() {
        if(appState.connectedMuse != null) {
            if (!appState.connectedMuse.isLowEnergy()) {
                samplingRate = 220;
            }
        }
        fft = new FFT(samplingRate, FFT_LENGTH, samplingRate);
        nbBins = fft.getFreqBins().length;
        bandExtractor = new BandPowerExtractor(fft.getFreqBins());
        dataListener = new ClassifierDataListener();
    }


    @ReactMethod
    public void startTracking() {
        isTracking = true;

        // Create PSDBuffer to smooth over last 4 collected epochs
        psdBuffer2D = new PSDBuffer2D(4, NUM_CHANNELS, nbBins);

        // Collect 4 epochs a second for collecting training data
        eegBuffer = new EpochBuffer(samplingRate, NUM_CHANNELS, samplingRate / EPOCHS_PER_SECOND);
        eegBuffer.addListener(this);

        appState.connectedMuse.registerDataListener(dataListener, MuseDataPacketType.EEG);
        startThread();
    }

    @ReactMethod
    public void stopTracking() {
        isTracking = false;
        appState.connectedMuse.unregisterDataListener(dataListener, MuseDataPacketType.EEG);
        stopThread();
    }

    // ---------------------------------------------------------
    // Thread management methods

    public void startThread() {
        Log.w("Tracker", "startthread");
        dataThread = new HandlerThread("dataThread");
        dataThread.start();
        dataHandler = new Handler(dataThread.getLooper());
    }

    public void stopThread() {
        Log.w("Tracker", "stopthread");

        if (dataHandler != null) {

            // Removes all runnables and things from the Handler
            dataHandler.removeCallbacksAndMessages(null);
            dataThread.quit();
        }
    }

    // -----------------------------------------------------------
    // Other methods

    @Override
    public void getEpoch(double[][] buffer) {
        dataHandler.post(new TrackerRunnable(buffer));
    }


    // Currently, just takes ratio of beta/theta power and makes it a percentage
    public int measureConcentration(double[] means){
        return (int) ((means[3] / means[1]) * 100) ;
    }


    // --------------------------------------------------------------
    // Runnables

    public class TrackerRunnable implements Runnable {

        private double[][] rawBuffer;
        private double[][] PSD;
        private double[] bandMeans;

        public TrackerRunnable(double[][] buffer) {
            rawBuffer = buffer;
            PSD = new double[NUM_CHANNELS][nbBins];
        }

        @Override
        public void run() {
            if (noisePresent(rawBuffer)) {
                Log.w("ConcentrationTracker", "noise");

                return;
            }

            if(isTracking) {
                getSmoothPSD(rawBuffer);

                bandMeans = bandExtractor.extract1D(PSD);

                // Concentration algorithm goes here
                int score = measureConcentration(bandMeans);

                Log.w("ConcentrationTracker", "Concentration score" + score);

                sendEvent("CONCENTRATION_SCORE", score);
            }
        }


        public boolean noisePresent(double[][] buffer) {
            for (boolean value : noiseDetector.detectArtefact(buffer)) {
                if (value) {
                    return true;
                }
            }
            return false;
        }

        public void getPSD(double[][] buffer) {
            // [nbch][nbsmp]
            for (int i = 0; i < NUM_CHANNELS; i++) {
                double[] channelPower = fft.computeLogPSD(buffer[i]);
                for (int j = 0; j < channelPower.length; j++) {
                    PSD[i][j] = channelPower[j];
                }
            }
        }

        public void getSmoothPSD(double[][] buffer) {
            // [nbch][nbsmp]
            for (int i = 0; i < NUM_CHANNELS; i++) {
                double[] channelPower = fft.computeLogPSD(buffer[i]);
                for (int j = 0; j < channelPower.length; j++) {
                    PSD[i][j] = channelPower[j];
                }
            }
            psdBuffer2D.update(PSD);
            PSD = psdBuffer2D.mean();
        }
    }

    // -------------------------------------------------------------
    // Data Listener

    public class ClassifierDataListener extends MuseDataListener {

        double[] newData;
        boolean filterOn;
        public Filter bandstopFilter;
        public double[][] bandstopFiltState;


        // if connected Muse is a 2016 BLE version, init a bandstop filter to remove 60hz noise
        ClassifierDataListener() {
            if (samplingRate == 256) {
                filterOn = true;
                bandstopFilter = new Filter(samplingRate, "bandstop", 5, 45, 55);
                bandstopFiltState = new double[4][bandstopFilter.getNB()];
            }
            newData = new double[4];
        }

        // Updates eegBuffer with new data from all 4 channels. Bandstop filter for 2016 Muse
        @Override
        public void receiveMuseDataPacket(final MuseDataPacket p, final Muse muse) {
            getEegChannelValues(newData, p);

            if (filterOn) {
                bandstopFiltState = bandstopFilter.transform(newData, bandstopFiltState);
                newData = bandstopFilter.extractFilteredSamples(bandstopFiltState);
            }

            eegBuffer.update(newData);
        }

        // Updates newData array based on incoming EEG channel values
        private void getEegChannelValues(double[] newData, MuseDataPacket p) {
            newData[0] = p.getEegChannelValue(Eeg.EEG1);
            newData[1] = p.getEegChannelValue(Eeg.EEG2);
            newData[2] = p.getEegChannelValue(Eeg.EEG3);
            newData[3] = p.getEegChannelValue(Eeg.EEG4);
        }

        @Override
        public void receiveMuseArtifactPacket(final MuseArtifactPacket p, final Muse muse) {
            // Does nothing for now
        }
    }
}
