package com.neurodoro.muse;

import android.content.Context;

import android.util.Log;
import android.widget.Toast;

import com.google.gson.Gson;
import com.neurodoro.cloud.CORVOSession;
import com.neurodoro.cloud.PubSubPublisher;

import java.io.IOException;

/**
 * Writes EEG data (either raw/filtered EEG) into a CORVOSession Object and fires it off with PubSub.
 * */
public class SessionBuilder {
  private Context context;
  private String dataType;
  private static boolean isRecording;
  private CORVOSession session;
  private String testType;
  private int sampleCount;
  private PubSubPublisher publisher;
  private int seqCounter;

  private int[] scores;

  public SessionBuilder(Context context, String dataType, String testType) {
    Log.w("MuseDataSource", "Abstract constructor called");
    this.context = context;
    isRecording = false;
    this.dataType = getDataType(dataType);
    this.testType = testType;
    this.scores = new int[2];

    session = new CORVOSession(testType, dataType);
  }

  // ---------------------------------------------------------------------------
  // Internal methods

  public void initSession() {
    session = new CORVOSession(testType, dataType);
    try {
      publisher = new PubSubPublisher(context);
    } catch (IOException e) {
      e.printStackTrace();
    }
    isRecording = true;
    sampleCount = 0;
    publisher.publishInfo(session.info);
    seqCounter = 0;
  }

  public void addSample(double[] data) {
   session.addSample(data, scores, seqCounter++); // Topic of bikeshedding discussion
    if(++sampleCount % 256 == 0) {
      // Send packet from pub sub
      publisher.publishSamples(session.samples);
      session.clearSamples();
    }
  }

  public void stopRecording() {
    isRecording = false;
  }

  public void updateScore(int difficulty, int performance) {
    scores[0] = difficulty;
    scores[1] = performance;
  }

  public void makeToast(String text) {
    Toast toast = Toast.makeText(context, text, Toast.LENGTH_SHORT);
    toast.show();
  }

  private String getDataType(String dataType) {

    switch (dataType) {
      case "DENOISED_PSD":
        return "DenoisedPSD";
      case "FILTERED_EEG":
        return "FilteredEEG";
      case "RAW_EEG":
        return "RawEEG";
      default:
        return "RawEEG";
    }
  }

  public String getCORVOSession() {
    Gson gson = new Gson();
    return gson.toJson(session);
  }

  public boolean isRecording() {
    return isRecording;
  }
}
