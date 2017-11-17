package com.neurodoro.muse;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

import com.google.android.gms.iid.InstanceID;
import com.google.gson.Gson;
import com.neurodoro.cloud.CORVOSession;
import com.neurodoro.cloud.CloudStorageHelper;
// import com.neurodoro.cloud.CloudStorageHelper;

import org.apache.commons.lang3.ArrayUtils;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Array;
import java.security.GeneralSecurityException;

/**
 * Writes EEG data (either raw/filtered EEG or computed FFT) into a csv. Presents a toast when
 * recording is started and sends data to Neurodoro data base when recording is completed
 */
public class EEGFileWriter {
  private Context context;
  private String dataType;
  private static boolean isRecording;
  private CORVOSession session;
  private String testType;

  private int[] scores;

  public EEGFileWriter(Context context, String dataType, String testType) {
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

  public void initFile() {
    Log.w("FileWriter", "init file called");
    session = new CORVOSession(testType, dataType);
    isRecording = true;
  }

  public void addSample(double[] data) {
    // Get relative timestamp
    session.addSample(data, scores, (int)System.currentTimeMillis()); // Topic of bikeshedding discussion
  }

  public void addPSDToFile(double[][] data) {
    // How about let's not right now
    return;
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
