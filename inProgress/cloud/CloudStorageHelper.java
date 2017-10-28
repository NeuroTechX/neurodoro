package com.neurodoro.cloud;

// Imports the Google Cloud client library
import android.net.Uri;
import android.os.Environment;
import android.util.Log;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson.JacksonFactory;
import com.google.api.services.storage.Storage;
import com.google.api.services.storage.StorageScopes;
import com.google.api.services.storage.model.StorageObject;
import com.google.cloud.storage.StorageOptions;
import com.neurodoro.MainActivity;
import com.neurodoro.MainApplication;
import com.neurodoro.NeurodoroPackage;
import com.neurodoro.cloud.StorageFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLConnection;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;

public class CloudStorageHelper {

    public void CloudStorageHelper(){

    }

    public static void uploadFile(String bucketName, String name, Uri uri)throws Exception {

        Storage storage = getStorage();
        StorageObject object = new StorageObject();
        object.setBucket(bucketName);
        File sdcard = Environment.getExternalStorageDirectory();
        //File file = new File(sdcard,filePath);
        File file = new File(uri.getPath());

        InputStream stream = new FileInputStream(file);

        try {
            String contentType = URLConnection.guessContentTypeFromStream(stream);
            InputStreamContent content = new InputStreamContent(contentType,stream);

            Storage.Objects.Insert insert = storage.objects().insert(bucketName, null, content);
            insert.setName(name);
            StorageObject obj = insert.execute();
            Log.d("uploadFile", obj.getSelfLink());
        } finally {
            stream.close();
        }
    }

    static Storage storage = null;
    private static Storage getStorage() throws Exception {

        if (storage == null) {
            HttpTransport httpTransport = new NetHttpTransport();
            JsonFactory jsonFactory = new JacksonFactory();
            List<String> scopes = new ArrayList<String>();
            scopes.add(StorageScopes.DEVSTORAGE_FULL_CONTROL);

            Credential credential = new GoogleCredential.Builder()
                    .setTransport(httpTransport)
                    .setJsonFactory(jsonFactory)
                    .setServiceAccountId("dano-neurotechx-com@euphoric-coral-122514.iam.gserviceaccount.com") //Email
                    .setServiceAccountPrivateKeyFromP12File(getTempPkc12File())
                    .setServiceAccountScopes(scopes).build();

            storage = new Storage.Builder(httpTransport, jsonFactory,
                    credential).setApplicationName("Neurodoro")
                    .build();
        }

        return storage;
    }

    private static File getTempPkc12File() throws IOException {
        // xxx.p12 export from google API c
        // onsole
        InputStream pkc12Stream = MainApplication.getInstance().getAssets().open("xxx.p12");
        File tempPkc12File = File.createTempFile("temp_pkc12_file", "p12");
        OutputStream tempFileStream = new FileOutputStream(tempPkc12File);

        int read = 0;
        byte[] bytes = new byte[1024];
        while ((read = pkc12Stream.read(bytes)) != -1) {
            tempFileStream.write(bytes, 0, read);
        }
        return tempPkc12File;
    }

}
