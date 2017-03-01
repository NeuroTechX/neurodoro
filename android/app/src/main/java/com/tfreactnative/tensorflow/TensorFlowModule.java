package com.tfreactnative.tensorflow;

/**
 * Created by dano on 01/03/17.
 */
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;

import org.tensorflow.contrib.android.TensorFlowInferenceInterface;


public class TensorFlowModule extends ReactContextBaseJavaModule {

    // Load tensorflow_interface native library
    static {
        System.loadLibrary("tensorflow_inference");
    }

    // Constants
    private static final String MODEL_FILE = "file:///android_asset/optimized_tfdroid.pb";
    private static final String INPUT_NODE = "I";
    private static final String OUTPUT_NODE = "O";

    private static final int[] INPUT_SIZE = {1,3};

    // Create TensorFlowInferenceInterface
    private TensorFlowInferenceInterface inferenceInterface;

    // ---------------------------------------------------------
    // Constructor
    public TensorFlowModule (ReactApplicationContext reactContext) {
        super(reactContext);
    }

    // ---------------------------------------------------------
    // React Native Module methods
    // Required by ReactContextBaseJavaModule
    @Override
    public String getName() {
        return "TensorFlowModule";
    }

    // ------------------------------------------------------------
    // Bridged methods
    @ReactMethod
    public void runInference(Float num1, Float num2, Float num3, Promise promise) {
        initInferenceInterface();

        float[] inputFloats = {num1, num2, num3};

        // Fill input nodes with desired values
        Log.w("Tensor", "Filling input nodes with: " + inputFloats[0] + inputFloats[1] +
                inputFloats[2]);
        inferenceInterface.fillNodeFloat(INPUT_NODE, INPUT_SIZE, inputFloats);

        // run inference for output node (like sess.run())

        inferenceInterface.runInference(new String[] {OUTPUT_NODE});

        WritableArray resultArray = Arguments.createArray();
        float[] result = {0, 0};

        // read output node value into result
        inferenceInterface.readNodeFloat(OUTPUT_NODE, result);

        for (float i : result) {
            double d = i;
            resultArray.pushDouble(d);
        }
        promise.resolve(resultArray);
    }

    //--------------------------------------------------------------
    // Internal methods

    public void initInferenceInterface() {
        inferenceInterface = new TensorFlowInferenceInterface();
        inferenceInterface.initializeTensorFlow(getCurrentActivity().getAssets(), MODEL_FILE);
    }




}
