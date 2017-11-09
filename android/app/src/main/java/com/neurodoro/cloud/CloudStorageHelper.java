package com.neurodoro.cloud;

import android.os.AsyncTask;
import android.util.Log;


public class CloudStorageHelper {

  public void CloudStorageHelper() {}

  public void uploadData(String builtCSV) {
    new UploadTask().execute(builtCSV);
  }

  private class UploadTask extends AsyncTask<String, Integer, String> {
    @Override
    protected void onPreExecute() {
      super.onPreExecute();
      Log.d("Main", "Launching Upload API request");
    }

    @Override
    protected String doInBackground(String... params) {
      String CSV_CONTENT = params[0];
      try {

      } catch (Exception e) {
        Log.d("Main", "Exception: " + e.toString());
      }
      return "Done";
    }

    @Override
    protected void onProgressUpdate(Integer... values) {
      super.onProgressUpdate(values);
    }

    @Override
    protected void onPostExecute(String msg) {
      super.onPostExecute(msg);
    }
  }
}
