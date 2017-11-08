package com.neurodoro.cloud;

// Imports the Google Cloud client library

import android.content.res.AssetManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
import android.support.annotation.RequiresPermission;
import android.util.Log;

import com.google.api.client.http.InputStreamContent;
import com.google.cloud.AuthCredentials;
import com.google.cloud.WriteChannel;
import com.google.cloud.bigquery.BigQuery;
import com.google.cloud.bigquery.BigQueryOptions;
import com.google.cloud.bigquery.FormatOptions;
import com.google.cloud.bigquery.Table;
import com.google.cloud.bigquery.TableId;
import com.google.cloud.bigquery.WriteChannelConfiguration;
import com.neurodoro.MainActivity;
import com.neurodoro.MainApplication;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class CloudStorageHelper {

  private BigQuery bigquery;
  // Credentials file: this file is stored in the assets/ directory. Replace it with yours.
  private final String CREDENTIALS_FILE = "My Project-be26f72bdd14.json";
  private final String PROJECT_ID = "euphoric-coral-122514";
  private final String DATASET = "neurodoro";
  private final String TABLE = "muse_data";
  private String JsonRows = "";
  private BigQueryTask task;

  public void CloudStorageHelper() {}

  public void uploadData(String builtCSV) {
    new BigQueryTask().execute(builtCSV.substring(0));
  }

  private class BigQueryTask extends AsyncTask<String, Integer, String> {
    @Override
    protected void onPreExecute() {
      super.onPreExecute();
      Log.d("Main", "Launching BigQuery API request");
    }

    @Override
    protected String doInBackground(String... params) {
      String CSV_CONTENT = params[0];
      try {
        AssetManager am = MainApplication.getInstance().getAssets();
        InputStream isCredentialsFile = am.open(CREDENTIALS_FILE);
        BigQuery bigquery =
            BigQueryOptions.builder()
                .authCredentials(AuthCredentials.createForJson(isCredentialsFile))
                .projectId(PROJECT_ID)
                .build()
                .service();

        TableId tableId = TableId.of(DATASET, TABLE);

        int num = 0;
        Log.d("Main", "Sending CSV: ");
        WriteChannelConfiguration configuration =
            WriteChannelConfiguration.builder(tableId).formatOptions(FormatOptions.csv()).build();
        try (WriteChannel channel = bigquery.writer(configuration)) {
          num = channel.write(ByteBuffer.wrap(CSV_CONTENT.getBytes(StandardCharsets.UTF_8)));
          channel.close();
        } catch (Exception e) {
          Log.d("Main", e.toString());
        }
        Log.d("Main", "Loading " + Integer.toString(num) + " bytes into table " + tableId);

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
      Log.d("Main", "onPostExecute: " + msg + " isCancelled: " + task.isCancelled());
    }
  }
}
