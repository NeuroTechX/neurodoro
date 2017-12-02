package com.neurodoro.cloud;

import android.content.Context;
import android.content.res.AssetManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.api.client.extensions.android.http.AndroidHttp;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.pubsub.Pubsub;
import com.google.api.services.pubsub.PubsubScopes;
import com.google.api.services.pubsub.model.PublishRequest;
import com.google.api.services.pubsub.model.PubsubMessage;

import com.google.gson.Gson;
import com.neurodoro.MainApplication;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.LinkedList;


public class PubSubPublisher {

  private static final String TAG = PubSubPublisher.class.getSimpleName();
  private final String mAppname;
  private String mTopic;
  private final Gson gson;
  private CORVOSession.StreamInfo info;
  private LinkedList<CORVOSession.StreamDataChunk> samples;
  private Context context;
  private Pubsub mPubsub;
  private Handler mHandler;
  private HandlerThread mHandlerThread;
  private HttpTransport mHttpTransport;

  public PubSubPublisher(Context ctxt) throws IOException {
    mAppname = "neurodoro";
    this.context = ctxt;
    mHandlerThread = new HandlerThread("pubsubPublisherThread");
    mHandlerThread.start();
    mHandler = new Handler(mHandlerThread.getLooper());

    AssetManager am = MainApplication.getInstance().getAssets();
    int credentialId =
        MainApplication.getInstance()
            .getResources()
            .getIdentifier("credentials", "raw", MainApplication.getInstance().getPackageName());

    InputStream jsonCredentials = context.getResources().openRawResource(credentialId);
    final GoogleCredential credentials;
    try {
      credentials =
          GoogleCredential.fromStream(jsonCredentials)
              .createScoped(Collections.singleton(PubsubScopes.PUBSUB));
    } finally {
      try {
        jsonCredentials.close();
      } catch (IOException e) {
        Log.e(TAG, "Error closing input stream", e);
      }
    }
    mHandler.post(
        new Runnable() {
          @Override
          public void run() {
            mHttpTransport = AndroidHttp.newCompatibleTransport();
            JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();
            mPubsub =
                new Pubsub.Builder(mHttpTransport, jsonFactory, credentials)
                    .setApplicationName(mAppname)
                    .build();
          }
        });

    gson = new Gson();
  }

  public void publishInfo(CORVOSession.StreamInfo streamInfo) {
    mHandler.post(new infoRunnable(streamInfo));
  }

  public void publishSamples(LinkedList<CORVOSession.StreamDataChunk> samplesChunk) {
    mHandler.post(new samplesRunnable(samplesChunk));
  }

  public void close() {
    mHandler.removeCallbacksAndMessages(null);
    mHandler.post(
        new Runnable() {
          @Override
          public void run() {
            try {
              mHttpTransport.shutdown();
            } catch (IOException e) {
              Log.d(TAG, "error destroying http transport");
            } finally {
              mHttpTransport = null;
              mPubsub = null;
            }
          }
        });
    mHandlerThread.quitSafely();
  }

  protected class infoRunnable implements Runnable {
    private CORVOSession.StreamInfo info;

    public infoRunnable(CORVOSession.StreamInfo info) {
      this.info = info;
      mTopic = "projects/" + "daos-84628" + "/topics/" + "sessionInfo";

    }

    public void run() {
      try {
        ConnectivityManager connectivityManager =
            (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = connectivityManager.getActiveNetworkInfo();
        if (activeNetwork == null || !activeNetwork.isConnectedOrConnecting()) {
          Log.e(TAG, "no active network");
          return;
        }
        String messagePayload = gson.toJson(info);
        PubsubMessage m = new PubsubMessage();
        m.setData(Base64.encodeToString(messagePayload.getBytes(), Base64.NO_WRAP));
        PublishRequest request = new PublishRequest();
        request.setMessages(Collections.singletonList(m));
        mPubsub.projects().topics().publish(mTopic, request).execute();
      } catch (IOException e) {
        Log.e(TAG, "Error publishing message", e);
      }
    }
  }

  protected class samplesRunnable implements Runnable {
    private LinkedList samples;

    public samplesRunnable(LinkedList<CORVOSession.StreamDataChunk> samples) {
      this.samples = samples;
      mTopic = "projects/" + "daos-84628" + "/topics/" + "corvo";

    }

    public void run() {
      try {
        ConnectivityManager connectivityManager =
                (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = connectivityManager.getActiveNetworkInfo();
        if (activeNetwork == null || !activeNetwork.isConnectedOrConnecting()) {
          Log.e(TAG, "no active network");
          return;
        }
        String messagePayload = gson.toJson(samples);
        PubsubMessage m = new PubsubMessage();
        m.setData(Base64.encodeToString(messagePayload.getBytes(), Base64.NO_WRAP));
        PublishRequest request = new PublishRequest();
        request.setMessages(Collections.singletonList(m));
        mPubsub.projects().topics().publish(mTopic, request).execute();
      } catch (IOException e) {
        Log.e(TAG, "Error publishing message", e);
      }
    }
  }
}
