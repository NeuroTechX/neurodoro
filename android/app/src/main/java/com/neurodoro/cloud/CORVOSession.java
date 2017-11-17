package com.neurodoro.cloud;

import com.google.android.gms.iid.InstanceID;
import com.google.gson.Gson;
import com.neurodoro.MainApplication;

import java.util.Date;
import java.util.LinkedList;

/**
 * A Java Object that can be converted to an LSL-ish data format for our DB
 */
public class CORVOSession {
    StreamInfo info;
    LinkedList<StreamDataChunk> samples = new LinkedList<>();

    public CORVOSession(String testType, String dataType) {
        //String uniqueID = "sadhkjlfgh";
        String uniqueID = InstanceID.getInstance(MainApplication.getInstance()).getId();
        String version = "1.0";
        Date createdAt = new Date(System.currentTimeMillis());
        String sessionID =
                uniqueID.substring(7) + Long.toString(System.currentTimeMillis()).substring(6, 11);

        info = new StreamInfo(testType, dataType, version, createdAt, uniqueID, sessionID);
    }

    // -------------------------------------------------------
    // Methods

    public void addSample(double[] data, int[] scores, int timestamp) {
        samples.add(new StreamDataChunk(data, scores, timestamp));
    }

    // -------------------------------------------------------
    // Subclasses (for nested data)

    private class StreamInfo {
        private final String name; // Test Type (i.e. CORVO)
        private final String type; // DataTyoe (i.e. raw EEG)
        private final String version; // Which release of the app
        private final Date created_at; // Start time in nice date format
        private final String uid;
        private final String session_id;
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

    private class StreamDataChunk {
        double[] data;
        int[] scores;
        int timestamp;

        public StreamDataChunk(double[] data, int[] scores, int timestamp) {
            this.data = data;
            this.scores = scores;
            this.timestamp = timestamp;
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
