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
import com.google.gson.reflect.TypeToken;
import com.neurodoro.MainApplication;

import org.apache.commons.lang3.ArrayUtils;
import org.json.JSONException;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class PubSubPublisher extends ReactContextBaseJavaModule {

  private static final String TAG = PubSubPublisher.class.getSimpleName();
  private final ReactApplicationContext mContext;
  private final String mAppname;
  private final String mTopic;
  private final Gson gson;
  private CORVOSession.StreamInfo info;
  private LinkedList<CORVOSession.StreamDataChunk> samples;
  private Pubsub mPubsub;
  private Handler mHandler;
  private HandlerThread mHandlerThread;
  private static final long PUBLISH_INTERVAL_MS = 1000;
  private int CHUNK_SIZE = 768;
  private HttpTransport mHttpTransport;

  public PubSubPublisher(ReactApplicationContext reactContext) throws IOException {
    super(reactContext);
    mContext = reactContext;
    mAppname = "neurodoro";
    mTopic = "projects/" + "daos-84628" + "/topics/" + "corvo";

    mHandlerThread = new HandlerThread("pubsubPublisherThread");
    mHandlerThread.start();
    mHandler = new Handler(mHandlerThread.getLooper());

    AssetManager am = MainApplication.getInstance().getAssets();
    int credentialId =
        MainApplication.getInstance()
            .getResources()
            .getIdentifier("credentials", "raw", MainApplication.getInstance().getPackageName());

    InputStream jsonCredentials =
        mContext.getResources().openRawResource(credentialId); // hopefully this works
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

  @ReactMethod
  public void start() {
    mHandler.post(mPublishRunnable);
  }

  @ReactMethod
  public void stop() {
    mHandler.removeCallbacks(mPublishRunnable);
  }

  @ReactMethod
  public void close() {
    mHandler.removeCallbacks(mPublishRunnable);
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

  @ReactMethod
  public void setSessionData(String sessionData) {
    CORVOSession session = gson.fromJson(sessionData, CORVOSession.class);
    info = session.info;
    samples = session.samples;
    Log.w("sampleSample", ArrayUtils.toString(samples.subList(40,45).toArray()));
  }

  private boolean infoSent = false;

  private Runnable mPublishRunnable =
      new Runnable() {
        @Override
        public void run() {
          Log.w("SamplesLengthRunnable", ""+samples.size());
          if (samples.size() <= CHUNK_SIZE) { // We'll lose the last chunk but w/e
            return;
          }

          ConnectivityManager connectivityManager =
              (ConnectivityManager) mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
          NetworkInfo activeNetwork = connectivityManager.getActiveNetworkInfo();
          if (activeNetwork == null || !activeNetwork.isConnectedOrConnecting()) {
            Log.e(TAG, "no active network");
            return;
          }

          try {
            String messagePayload;
            if (!infoSent) {
              Log.w("PubSub", "sending info");
              messagePayload = createInfoPayload();
              infoSent = true;
            } else {
              Log.w("PubSub", "sending chunk");
              messagePayload = createChunkPayload();
            }

            Log.d(TAG, "publishing message: " + messagePayload.length());
            PubsubMessage m = new PubsubMessage();
            m.setData(Base64.encodeToString(messagePayload.getBytes(), Base64.NO_WRAP));
            PublishRequest request = new PublishRequest();
            request.setMessages(Collections.singletonList(m));
            mPubsub.projects().topics().publish(mTopic, request).execute();
          } catch (JSONException | IOException e) {
            Log.e(TAG, "Error publishing message", e);
          } finally {
            mHandler.postDelayed(mPublishRunnable, PUBLISH_INTERVAL_MS);
          }
        }

        private String createInfoPayload() throws JSONException {
          Log.w("info", gson.toJson(info));
          return gson.toJson(info);
        }

        private String createChunkPayload() throws JSONException {
          LinkedList<CORVOSession.StreamDataChunk> chunk = new LinkedList<>();

          for(int i = 0; i < CHUNK_SIZE; i++){
            chunk.add(samples.removeFirst());
          }
          Log.w("chunk", gson.toJson(chunk));
          return gson.toJson(chunk);
        }
      };

  @Override
  public String getName() {
    return "PubSubPublisher";
  }
}
