package com.neurodoro.signal;

/**
 * Processes the data for Tensorflow with the following steps:
 * 1. Collects raw EEG from all 4 electrodes in 2s windows
 * 2. Performs a 1-50hz bandpass filter
 * 3. Tosses out epochs with noise
 * 4. Performs FFT
 * 5. Normalises to largest value bin in FFT
 */

public class PreProcessing {



}
