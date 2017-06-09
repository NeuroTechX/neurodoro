package com.neurodoro.muse

import android.util.Log

import com.choosemuse.libmuse.Eeg
import com.choosemuse.libmuse.Muse
import com.choosemuse.libmuse.MuseArtifactPacket
import com.choosemuse.libmuse.MuseDataListener
import com.choosemuse.libmuse.MuseDataPacket
import com.choosemuse.libmuse.MuseDataPacketType
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.neurodoro.MainApplication
import com.neurodoro.signal.CircularBuffer
import com.neurodoro.signal.FFT
import com.neurodoro.signal.Filter
import com.neurodoro.signal.DynamicSeries
import com.neurodoro.signal.NoiseDetector
import com.neurodoro.signal.PSDBuffer2D
import com.neurodoro.muse.MuseDataSource

/**
 * Streams data from Muses and performs preprocessing functions
 */

class MuseRecorder// ---------------------------------------------------------
// Constructor
(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    // ----------------------------------------------------------
    // Variables

    var dataSeries: DynamicSeries? = null
    internal var TAG = "EEGGraph"
    var BUFFER_LENGTH: Int = 0
    internal var dataThread: Thread
    internal var data: MuseDataSource
    var dataListener: DataListener? = null
    var eegBuffer: CircularBuffer
    var userName = ""
    var fileNum = 0

    // Filter variables
    var filterFreq: Int = 0
    var bandPassFilter: Filter
    var bandPassFiltState: Array<DoubleArray>
    var filtResult = DoubleArray(4)

    // Bridged props
    var recorderDataType = "DENOISED_PSD"

    // Reference to global Muse
    internal var appState: MainApplication

    init {
        appState = reactContext.applicationContext as MainApplication
    }

    // ---------------------------------------------------------
    // React Native Module methods
    // Required by ReactContextBaseJavaModule

    override fun getName(): String {
        return "MuseRecorder"
    }

    // Called to emit events to event listeners in JS
    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
                .getJSModule<DeviceEventManagerModule.RCTDeviceEventEmitter>(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
    }

    // ---------------------------------------------------------
    // Bridged methods

    @ReactMethod
    fun startRecording(dataType: String) {
        Log.w("Listener", "Start Listening Called")
        this.recorderDataType = dataType
        initListener()
        data.fileWriter.initFile()
        startDataThread()
    }

    @ReactMethod
    fun stopRecording() {
        Log.w("Listener", "Stop Listening Called")
        stopThreads()
        fileNum++
    }

    @ReactMethod
    fun sendTaskInfo(difficulty: Int, performance: Int) {
        if (data.fileWriter != null) {
            data.fileWriter.updateTaskInfo(difficulty, performance)
        }
    }

    @ReactMethod
    fun setUserName(name: String) {
        this.userName = name
    }

    // ---------------------------------------------------------
    // Internal Methods

    fun initListener() {
        Log.w("Listener", "Init Listener Called")

        // Set sampling frequency based on type of Muse
        if (appState.connectedMuse.isLowEnergy()) {
            filterFreq = 256
        } else {
            filterFreq = 220
        }
        BUFFER_LENGTH = filterFreq

        // Create new eegBuffer
        eegBuffer = CircularBuffer(BUFFER_LENGTH, 4)

        // Create PSDDataSource if recorder is to record PSD data, EEGDataSource otherwise
        if (recorderDataType.contains("PSD")) {
            Log.w("Listener", "PSD datatype detected")
            data = PSDDataSource(fileNum)
        } else {
            Log.w("Listener", "EEG datatype detected")
            data = EEGDataSource(fileNum)

            // If data will be filtered, create filters
            if (recorderDataType.contains("FILTERED")) {
                Log.w("Listener", "Filter detected")
                bandPassFilter = Filter(filterFreq.toDouble(), "bandpass", 4, 1.0, 50.0)
                bandPassFiltState = Array(4) { DoubleArray(bandPassFilter.nb) }
            }
        }

        // Register a listener to receive connection state changes.
        dataListener = DataListener()
        appState.connectedMuse.registerDataListener(dataListener, MuseDataPacketType.EEG)
    }

    // ---------------------------------------------------------
    // Thread management functions

    fun startDataThread() {
        dataThread = Thread(data)
        dataThread.start()
    }

    fun stopThreads() {
        data.stopThread()
        if (dataListener != null) {
            appState.connectedMuse.unregisterDataListener(dataListener, MuseDataPacketType.EEG)
        }
    }

    // --------------------------------------------------------------
    // Listeners

    // Listener that receives incoming data from the Muse. Will run receiveMuseDataPacket
    // Will call receiveMuseDataPacket as data comes in around 220hz (250hz for Muse 2016)
    inner class DataListener internal constructor() : MuseDataListener() {
        private var newData: DoubleArray? = null
        // Filter variables
        var filterOn = false
        var bandstopFilter: Filter
        var bandstopFiltState: Array<DoubleArray>
        var bandstopFiltResult: DoubleArray? = null

        init {
            if (appState.connectedMuse.isLowEnergy()) {
                filterOn = true
                bandstopFilter = Filter(256.0, "bandstop", 5, 55.0, 65.0)
                bandstopFiltState = Array(4) { DoubleArray(bandstopFilter.nb) }
            }
            newData = DoubleArray(4)
        }

        override fun receiveMuseDataPacket(p: MuseDataPacket, muse: Muse) {
            getEegChannelValues(newData, p)

            // BandStop filter for 2016 Muses
            if (filterOn) {
                bandstopFiltState = bandstopFilter.transform(newData, bandstopFiltState)
                newData = bandstopFilter.extractFilteredSamples(bandstopFiltState)
            }

            // Optional filter for filtered data
            if (recorderDataType.contains("FILTERED")) {
                // Filter new raw sample
                bandPassFiltState = bandPassFilter.transform(newData,
                        bandPassFiltState)
                filtResult = bandPassFilter.extractFilteredSamples(bandPassFiltState)
                // Adds datapoint from all 4 channels to csv
                data.fileWriter.addEEGDataToFile(filtResult)
            } else {

                // Adds datapoint from all 4 channels to csv
                data.fileWriter.addEEGDataToFile(newData)
            }
        }

        private fun getEegChannelValues(buffer: DoubleArray, p: MuseDataPacket) {
            buffer[0] = p.getEegChannelValue(Eeg.EEG1)
            buffer[1] = p.getEegChannelValue(Eeg.EEG2)
            buffer[2] = p.getEegChannelValue(Eeg.EEG3)
            buffer[3] = p.getEegChannelValue(Eeg.EEG4)
        }

        override fun receiveMuseArtifactPacket(p: MuseArtifactPacket, muse: Muse) {
            // Does nothing for now
        }
    }

    // --------------------------------------------------------------
    // Runnables

    // Runs an FFT on data in eegBuffer when it fills up, checks for noise, and writes data to
    // csv file if it is noise-free
    inner class PSDDataSource
    // Setting appropriate variance for noise detector (being pretty generous)

    (fileNum: Int) : MuseDataSource(currentActivity, recorderDataType, fileNum, BUFFER_LENGTH / 2), Runnable {
        private val nbChannels = 4
        private val noiseDetector: NoiseDetector
        private var noiseArray: BooleanArray? = null
        internal var fftLength = BUFFER_LENGTH
        internal var nbFreqBins = BUFFER_LENGTH / 2
        private val fft = FFT(BUFFER_LENGTH, fftLength, filterFreq.toDouble())
        internal var fftBufferLength = 20
        internal var psdBuffer = PSDBuffer2D(fftBufferLength, nbChannels, nbFreqBins)
        var latestSamples = Array(nbChannels) { DoubleArray(BUFFER_LENGTH) }
        var tempPSD = DoubleArray(nbFreqBins)
        internal var logPSD = Array(nbChannels) { DoubleArray(nbFreqBins) }
        var smoothLogPower = Array(nbChannels) { DoubleArray(nbFreqBins) }

        init {
            noiseDetector = NoiseDetector(600.0)
            fileWriter.updateUserName(userName)
        }

        override fun run() {
            try {
                keepRunning = true
                while (keepRunning) {
                    if (eegBuffer.pts >= BUFFER_LENGTH) {

                        // Extract latest samples
                        latestSamples = eegBuffer.extractTransposed(BUFFER_LENGTH)

                        // Check for noise. Proceed only if it's clean
                        noiseArray = noiseDetector.detectArtefact(latestSamples)
                        if (isNoiseFree(noiseArray)) {
                            Log.w("Listener", "Clean array!")

                            // Compute average PSD for all channels in latest samples and add to
                            // PSDBuffer
                            psdBuffer.fftAndUpdate(latestSamples, fft)

                            // Compute average PSD over buffer
                            smoothLogPower = psdBuffer.mean()

                            // Add all 4 channels' smoothed PSDs to the CSV file
                            fileWriter.addPSDToFile(smoothLogPower)
                        }

                        // resets the 'points-since-dataSource-read' value
                        eegBuffer.resetPts()
                    }
                }
            } catch (e: Exception) {
                Log.e("MuseRecorder", "Error in runnable " + e)
            }

        }

        fun isNoiseFree(array: BooleanArray): Boolean {
            for (i in array.indices)
                if (array[i]) {
                    Log.w("Listener", "Noise detected in electrode " + (i + 1))
                    return false
                }
            return true
        }

        fun clearDataBuffer() {
            psdBuffer.clear()
            eegBuffer.clear()
        }

    }

    // Runnable adds raw or filtered EEG to a csv as it comes in
    inner class EEGDataSource(fileNum: Int) : MuseDataSource(currentActivity, recorderDataType, fileNum), Runnable {
        private val stepSize = 1
        var latestSamples: DoubleArray? = null

        init {
            fileWriter.updateUserName(userName)
        }

        override fun run() {
            try {
                keepRunning = true
                while (keepRunning) {
                    if (eegBuffer.pts >= stepSize) {
                        // Doesn't need to do anything
                    }
                }
            } catch (e: Exception) {
            }

        }

        fun clearDataBuffer() {
            eegBuffer.clear()
        }

    }
}


