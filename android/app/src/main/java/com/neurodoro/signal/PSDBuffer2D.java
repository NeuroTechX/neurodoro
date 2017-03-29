package com.neurodoro.signal;

import android.util.Log;

import java.util.Arrays; // For printing arrays when debugging

public class PSDBuffer2D extends CircBuffer2D {
    // This class extends CircBuffer2D to expose PSD-specific methods
    // such as noise marking in a joined buffer, and mean across epochs

    // ------------------------------------------------------------------------
    // Variables

    public PSDBuffer2D(int bufferLength, int nbChannels, int nbBins) {

        super(bufferLength, nbChannels, nbBins);
    }

    public void update(double[][] newData) {
        super.update(newData);

    }

    public double[][] mean() {
        // Compute the mean of the buffer across epochs (1st dimension of `buffer`).

        double[][] bufferMean = new double[nbCh][nbBins];
        int nbPointsSummed = 0;

        // Loop through all 20 PSDs stored in Buffer
        for (int i = 0; i <  this.bufferLength; i++) {
            nbPointsSummed++;

            // Loop through all channels 0-4
            for (int c = 0; c <  this.nbCh; c++) {


                // Loop through all bins, summing each bins value with previous values in the epoch
                for (int n = 0; n <  this.nbBins; n++) {
                    bufferMean[c][n] = bufferMean[c][n] + buffer[i][c][n];
                }
            }
        }

        for (int c = 0; c <  this.nbCh; c++) {
            Log.w("Mean", "summed" + bufferMean[c][0]);
            for (int n = 0; n <  this.nbBins; n++) {
                bufferMean[c][n] /= nbPointsSummed;
            }
            Log.w("Mean", "averaged" + bufferMean[c][0]);
        }

        return bufferMean;
    }

    public static void main(String[] args ) {

        // Create test buffer
        int testBufferLength = 5;
        int testNbCh = 4;
        int testNbBins = 3;
        PSDBuffer2D testBuffer = new PSDBuffer2D(testBufferLength,testNbCh,testNbBins);

        // Update buffer a few times with fake data
        double[][] fakeSamples = new double[][]{{0,1,2}, {3,4,5}, {6,7,8}, {9,10,11}};
        int nbUpdates = 3;
        for(int i = 0; i < nbUpdates; i++){
            testBuffer.update(fakeSamples);
        }

        // Update with fake sample data
        testBuffer.update(fakeSamples);

        // Print buffer
        testBuffer.print();

        // Extract latest samples from buffer
        double[][][] testExtractedArray = testBuffer.extract(4);
        System.out.println(Arrays.deepToString(testExtractedArray));

        // Reset number of collected points
        testBuffer.resetPts();

        // Print mean of buffer
        double[][] bufferMean = testBuffer.mean();
        System.out.println(Arrays.deepToString(bufferMean));
    }

}