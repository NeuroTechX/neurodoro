package com.neurodoro.cloud;

// Imports the Google Cloud client library
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Environment;
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


public class CloudStorageHelper {

    private BigQuery bigquery;
    // Credentials file: this file is stored in the assets/ directory. Replace it with yours.
    private final String CREDENTIALS_FILE = "My Project-be26f72bdd14.json";
    private final String PROJECT_ID = "euphoric-coral-122514";
    private final String DATASET = "neurodoro";
    private final String TABLE = "muse_data";
    private String JsonRows = "";

    public void CloudStorageHelper(){

    }

    public void uploadData(){
        new BigQueryTask().execute(JsonRows);
    }

    private class BigQueryTask extends AsyncTask<String, Integer, String> {
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            Log.d("Main", "Launching BigQuery API request");
        }

        @Override
        protected String doInBackground(String... params) {

//            String JSON_CONTENT_TEST =
//                    "{" +
//                            "\"X\": \"1.0\", " +
//                            "\"Y\": \"2.0\", " +
//                            "\"Z\": \"3.0\"" +
//                            "}";

            String JSON_CONTENT_ARRAY_TEST =
                    "{" +
                            "\"X\": \"1.0\", " +
                            "\"Y\": \"2.0\", " +
                            "\"Z\": \"3.0\"" +
                            "}\r\n{" +
                            "\"X\": \"4.0\", " +
                            "\"Y\": \"5.0\", " +
                            "\"Z\": \"6.0\"" +
                            "}";

            String JSON_CONTENT = params[0];
            try {
                AssetManager am = MainApplication.getInstance().getAssets();
                InputStream isCredentialsFile = am.open(CREDENTIALS_FILE);
                BigQuery bigquery = BigQueryOptions.builder()
                        .authCredentials(AuthCredentials.createForJson(isCredentialsFile))
                        .projectId( PROJECT_ID )
                        .build().service();

                TableId tableId = TableId.of(DATASET,TABLE);
                Table table = bigquery.getTable(tableId);

                int num = 0;
                Log.d("Main", "Sending JSON: " + JSON_CONTENT_ARRAY_TEST);
                WriteChannelConfiguration configuration = WriteChannelConfiguration.builder(tableId)
                        .formatOptions(FormatOptions.json())
                        .build();
                try (WriteChannel channel = bigquery.writer(configuration)) {
                    num = channel.write(ByteBuffer.wrap(JSON_CONTENT.getBytes(StandardCharsets.UTF_8)));
                    channel.close();
                } catch (IOException e) {
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
            Log.d("Main", "onPostExecute: " + msg);

            // Init variable for next cycle
            JsonRows = "";
        }
    }

}
