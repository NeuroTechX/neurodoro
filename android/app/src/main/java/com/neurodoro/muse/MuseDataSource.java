package com.neurodoro.muse;

import android.content.Context;
import android.provider.Settings;
import android.util.Log;

import com.neurodoro.muse.EEGFileWriter;

/**
 * Created by dano on 29/03/17.
 */

public abstract class MuseDataSource implements Runnable {
    public boolean keepRunning;
    public EEGFileWriter fileWriter;

    public MuseDataSource(Context context, String dataType, int fileNum) {
        Log.w("MuseDataSource", "Abstract constructor called");
        fileWriter = new EEGFileWriter(context, dataType, fileNum);
    }
    public MuseDataSource(Context context, String dataType, int fileNum, int nbFreqbins) {
        Log.w("MuseDataSource", "Abstract constructor called");
        fileWriter = new EEGFileWriter(context, dataType, fileNum, nbFreqbins);
    }

    public void stopThread() {
        keepRunning = false;
        fileWriter.writeFile();
    }
}


