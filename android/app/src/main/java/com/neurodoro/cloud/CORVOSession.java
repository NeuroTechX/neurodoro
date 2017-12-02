package com.neurodoro.cloud;

import android.content.Context;

import com.google.android.gms.iid.InstanceID;
import com.google.gson.Gson;
import com.neurodoro.MainApplication;

import java.util.Date;
import java.util.LinkedList;
import java.util.stream.Stream;

import okhttp3.internal.connection.StreamAllocation;

/**
 * A Java Object that can be converted to an LSL-ish data format for our DB
 */
public class CORVOSession {
    public StreamInfo info;
    public LinkedList<StreamDataChunk> samples;
    private String uid;
    private String sessionID;

    public CORVOSession(String testType, String dataType) {
        this.uid = InstanceID.getInstance(MainApplication.getInstance()).getId();
        String version = "1.0";
        Date createdAt = new Date(System.currentTimeMillis());
        this.sessionID =
                uid.substring(7) + Long.toString(System.currentTimeMillis()).substring(6, 11);

        samples = new LinkedList<StreamDataChunk>();
        info = new StreamInfo(testType, dataType, version, createdAt, uid, sessionID);
    }

    // -------------------------------------------------------
    // Methods

    public void addSample(double[] data, int[] scores, long timestamp) {
        StreamDataChunk newChunk = new StreamDataChunk(data.clone(), scores.clone(), timestamp, uid, sessionID);
        samples.add(newChunk);
    }

    public void clearSamples() {
        this.samples = new LinkedList<StreamDataChunk>();
    }

    // -------------------------------------------------------
    // Subclasses (for nested data)

    protected class StreamInfo {
        private final String name; // Test Type (i.e. CORVO)
        private final String type; // DataTyoe (i.e. raw EEG)
        private final String version; // Which release of the app
        private final Date created_at; // Start time in nice date format
        public  String uid; // Instance ID
        public  String session_id;
        private final int channel_count;
        private final int nominal_srate;
        private final String source_id;
        private final String manufacturer;

        public StreamInfo(
                String title,
                String dataType,
                String version,
                Date createdAt,
                String uniqueID,
                String sessionID) {
            this.name = title;
            this.type = dataType;
            this.version = version;
            this.created_at = createdAt;
            this.uid = uniqueID;
            this.session_id = sessionID;
            this.channel_count = 4;
            this.nominal_srate = 256;
            this.source_id = "NeuroTechTO";
            this.manufacturer = "Interaxon";
        }
    }

    protected class StreamDataChunk {
        double[] data;
        int[] scores;
        long timestamp;
        public  String uid; // Instance ID
        public  String session_id;

        public StreamDataChunk(double[] data, int[] scores, long timestamp, String uid, String session_id) {
            this.data = data;
            this.scores = scores;
            this.timestamp = timestamp;
            this.uid = uid;
            this.session_id = session_id;
        }
    }

    // ---------------------------------------
    // main for testing

    // NOTE: this will error out because the InstanceID get doesn't work outside of a phone
    public static void main(String[] args) {

        Gson gson = new Gson();
        long startTime = System.currentTimeMillis();
        double[][] testSamples =
                new double[][]{
                        {500.0, 450.0, 233.0, 544.0}, {470.0, 420.0, 255.0, 412.0}, {320.0, 785.0, 242.0, 644.0}
                };
        int[][] testScores =
                new int[][]{
                        {0, 0}, {12, 40}, {45, 50}
                };

        CORVOSession sesh = new CORVOSession("CORVO", "raw EEG");

        // Add those testy boys
        for (int i = 0; i < testSamples.length; i++) {
            try {
                sesh.addSample(testSamples[i], testScores[i], (int) System.currentTimeMillis() - (int) startTime);
                Thread.sleep(25);
            } catch (Exception e) {
                System.out.print("Ya dicked er");
            }
        }

        String json = gson.toJson(sesh);

        System.out.println(json);
    }
}
