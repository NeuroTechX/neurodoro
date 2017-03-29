package com.neurodoro.muse;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;

/**
 * Writes EEG data (either raw/filtered EEG or computed FFT) into a csv. Presents a toast when
 * recording is started and sends data to Neurodoro data base when recording is completed
 */

public class EEGFileWriter {

    // ---------------------------------------------------------------------------
    // Variables

    private Context context;
    private String title;
    StringBuilder builder;
    int fileNum = 1;
    private int nbFreqBins = 0;
    public FileWriter fileWriter;
    private static boolean isRecording;
    private int difficulty = 0;
    private int performance = 0;

    // ---------------------------------------------------------------------------
    // Constructor

    public EEGFileWriter(Context context, String title) {
        Log.w("MuseDataSource", "Abstract constructor called");
        this.context = context;
        isRecording = false;
        this.title = getTitleFromDataType(title);
    }

    public EEGFileWriter(Context context, String title, int nbFreqBins) {
        Log.w("MuseDataSource", "Abstract constructor called");
        this.context = context;
        this.nbFreqBins = nbFreqBins;
        isRecording = false;
        this.title = getTitleFromDataType(title);
    }

    // ---------------------------------------------------------------------------
    // Internal methods

    public void initFile() {
        Log.w("FileWriter", "init file called");
        builder = new StringBuilder();
        builder.append("Timestamp (ms),");
        builder.append("Difficulty,");
        builder.append("Performance,");
        if(title.contains("PSD")) {
            builder.append("Channel");
            for(int i=1; i<= nbFreqBins; i++) {
                builder.append(i + " hz");
                if (i < nbFreqBins - 1) {
                    builder.append(",");
                }
            }
        } else {
            for(int i=1; i<= 4; i++) {
                builder.append("Channel " + i);
                if (i < 5 - 1) {
                    builder.append(",");
                }
            }
        }
        builder.append("\n");
        makeToast();
        isRecording = true;
    }

    public void addEEGDataToFile(double[] data) {

        // Append timestamp
        Long tsLong = System.currentTimeMillis();
        builder.append(tsLong.toString() +",");

        // Append task info
        builder.append(this.difficulty + ",");
        builder.append(this.performance + ",");

        // Loop through all 4 channels and write data

        for (int j = 0; j < data.length; j++) {
            builder.append(Double.toString(data[j]));
            if (j < data.length - 1) {
                builder.append(",");
            }
        }
        builder.append("\n");
    }

    public void addPSDToFile(double[][] data) {
        Log.w("FileWriter", "Adding PSD to file");

        // Loop through all 4 channels
        for (int j = 0; j < data.length; j++) {

            // Append timestamp
            Long tsLong = System.currentTimeMillis();
            builder.append(tsLong.toString() +",");

            // Append task info
            builder.append(Integer.toString(this.difficulty) + ",");
            builder.append(Integer.toString(this.performance) + ",");

            // Append channel number
            builder.append(j + 1 + ",");

            // Loop through all freqbins
            for (int i = 0; i < data[j].length; i++) {
                builder.append(Double.toString(data[j][i]));
                if (i < data[j].length - 1) {
                    builder.append(",");
                }
            }
            builder.append("\n");
        }
    }

    public void writeFile() {
        try {
            final File dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
            final File file = new File(dir,
                    title+fileNum+
                            ".csv");
            Log.w("Listener", "Creating new file " + file);
            fileWriter = new java.io.FileWriter(file);

            if (!dir.exists()) {
                dir.mkdir();
            }


            BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);
            bufferedWriter.write(builder.toString());
            bufferedWriter.close();

            sendData(file);
            fileNum ++;
            isRecording = false;
        } catch (IOException e) {}
    }

    public void updateTaskInfo(int difficulty, int performance) {
        this.difficulty = difficulty;
        this.performance = performance;
    }

    public void makeToast() {
        CharSequence toastText = "Recording data in " + title+fileNum+".csv";
        Toast toast = Toast.makeText(context, toastText, Toast.LENGTH_SHORT);
        toast.show();
    }

    private String getTitleFromDataType(String dataType) {

        switch(dataType) {
            case "DENOISED_PSD":
                return "DenoisedPSD";
            case "FILTERED_EEG":
                return "FilteredEEG";
            case "RAW_EEG":
                return "RawEEG";
            default:
                return "DenoisedPSD";
        }
    }

    public void sendData(File dataCSV) {
        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.setType("application/csv");
        sendIntent.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(dataCSV));
        sendIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(Intent.createChooser(sendIntent, "Export " +
                "data to..."));
    }

    public boolean isRecording() {
        return isRecording;
    }
}
