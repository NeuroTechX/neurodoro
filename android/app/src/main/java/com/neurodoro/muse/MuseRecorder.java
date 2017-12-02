package com.neurodoro.muse;

import android.util.Log;

import com.choosemuse.libmuse.Eeg;
import com.choosemuse.libmuse.Muse;
import com.choosemuse.libmuse.MuseArtifactPacket;
import com.choosemuse.libmuse.MuseDataListener;
import com.choosemuse.libmuse.MuseDataPacket;
import com.choosemuse.libmuse.MuseDataPacketType;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.neurodoro.MainApplication;
import com.neurodoro.signal.Filter;

/** Streams data from Muses and performs preprocessing functions */
public class MuseRecorder extends ReactContextBaseJavaModule {

  // ----------------------------------------------------------
  // Variables

  Thread dataThread;
  public int samplingFreq;
  public int BUFFER_LENGTH;
  public DataListener dataListener;
  public String userName = "";
  public int fileNum = 0;
  public SessionBuilder sessionBuilder;
  private String testType;

  // Filter variables
  public Filter bandPassFilter;
  public double[][] bandPassFiltState;

  // Bridged props
  public String dataType;

  // Reference to global Muse
  MainApplication appState;

  // ---------------------------------------------------------
  // Constructor
  public MuseRecorder(ReactApplicationContext reactContext) {
    super(reactContext);
    appState = ((MainApplication) reactContext.getApplicationContext());
  }

  // ---------------------------------------------------------
  // React Native Module methods
  // Required by ReactContextBaseJavaModule

  @Override
  public String getName() {
    return "MuseRecorder";
  }

  // ---------------------------------------------------------
  // Bridged methods

  @ReactMethod
  public void startRecording(String dataType, String testType) {
    this.dataType = dataType;
    this.testType = testType;
    initListener();
  }

  @ReactMethod
  public void stopRecording() {
    if (dataListener != null) {
      appState.connectedMuse.unregisterDataListener(dataListener, MuseDataPacketType.EEG);
    }
    sessionBuilder.stopRecording();
    fileNum++;
  }

  @ReactMethod
  public void updateScore(int difficulty, int performance) {
    if (sessionBuilder != null) {
      sessionBuilder.updateScore(difficulty, performance);
    }
  }

  @ReactMethod
  public void getCORVOSession(Callback errorCallback, Callback successCallback) {
    try {
      successCallback.invoke(sessionBuilder.getCORVOSession());

    } catch (Exception e) {
      errorCallback.invoke(e.getMessage());
    }
  }

  // ---------------------------------------------------------
  // Internal Methods

  public void initListener() {
    Log.w("Listener", "Init Listener Called");

    // Set sampling frequency based on type of Muse
    if (appState.connectedMuse.isLowEnergy()) {
      samplingFreq = 256;
    } else {
      samplingFreq = 220;
    }

    Log.w("Listener", "EEG datatype detected");
    sessionBuilder = new SessionBuilder(getCurrentActivity(), dataType, testType);
    sessionBuilder.initSession();

    // If data will be filtered, create filters
    if (dataType.contains("FILTERED")) {
      Log.w("Listener", "Filter detected");
      bandPassFilter = new Filter(samplingFreq, "bandpass", 4, 1, 40);
      bandPassFiltState = new double[4][bandPassFilter.getNB()];
    }

    // Register a listener to receive data.
    dataListener = new DataListener();
    MainApplication.connectedMuse.registerDataListener(dataListener, MuseDataPacketType.EEG);
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
        bandstopFilter = new Filter(256, "bandstop", 5, 45, 55);
        bandstopFiltState = new double[4][bandstopFilter.getNB()];
      }
      newData = new double[4];
    }

    @Override
    public void receiveMuseDataPacket(final MuseDataPacket p, final Muse muse) {
      getEegChannelValues(newData, p);

      // BandStop filter for 2016 Muses
      if (filterOn) {
        bandstopFiltState = bandstopFilter.transform(newData, bandstopFiltState);
        newData = bandstopFilter.extractFilteredSamples(bandstopFiltState);
      }

      // Optional filter for filtered data
      if (dataType.contains("FILTERED")) {
        bandPassFiltState = bandPassFilter.transform(newData, bandPassFiltState);
        newData = bandPassFilter.extractFilteredSamples(bandPassFiltState);
      }

      sessionBuilder.addSample(newData);
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
}
