package io.appery.project178389;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import com.phonegap.plugins.pushnotifications.Constants;
import com.phonegap.plugins.pushnotifications.PushNotifications;
import org.apache.cordova.*;


public class PhoneGapActivity extends org.apache.cordova.DroidGap {

    private final static String TAG = "PhoneGapActivity";

    private static final String WORK_DIR = "file:///android_asset/www/";

    protected static final int FILECHOOSER_RESULTCODE = 101;

    public static final String DEFAULT_ACCEPT_TYPE = "image/*";

    protected ValueCallback<Uri> mUploadMessage;

    /**
     * Called when the activity is first created.
     *
     * @param savedInstanceState If the activity is being re-initialized after previously being shut down then this Bundle contains the
     *                           data it most recently supplied in onSaveInstanceState(Bundle). <b>Note: Otherwise it is null.</b>
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d(TAG, "onCreate");

        int splashImageResourceIdentifier = getResources().getIdentifier("splash", "drawable", getPackageName());
        if (splashImageResourceIdentifier != 0) {
            super.setIntegerProperty("splashscreen", splashImageResourceIdentifier);
            super.loadUrl(WORK_DIR + getStartFileName(), 10000);
        } else {
            super.loadUrl(WORK_DIR + getStartFileName());
        }

        super.setIntegerProperty("loadUrlTimeoutValue", 60000);
        this.appView.clearCache(false);
        this.appView.clearHistory();

        // Set some defaults
        this.appView.setHorizontalScrollBarEnabled(false);
        this.appView.setHorizontalScrollbarOverlay(false);
        this.appView.setVerticalScrollBarEnabled(false);
        this.appView.setVerticalScrollbarOverlay(false);

        if (getIntent().hasExtra(Constants.EVENT.MESSAGE_RECEIVED)) {
            // Application is started by clicking on notification
            PushNotifications.handleMessage(getIntent());
        }

        // Set some defaults on the web view
        this.appView.getSettings().setBuiltInZoomControls(false);
        this.appView.getSettings().setSupportZoom(true);
        this.appView.getSettings().setGeolocationEnabled(true);
        this.appView.getSettings().setLightTouchEnabled(false);

        // Caching is preventin android 2.3.3 from working properly with REST calls (ETST-5834, ETST-6716)
        this.appView.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);

        this.appView.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);

        /*
        Enabling hardware acceleration to make CSS rules like translate3d work properly.
        0x01000000 is actually WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED flag, but it doesn't exist in
        android 2.2.1 lib that is present in maven dependency management.
         */
        if (android.os.Build.VERSION.SDK_INT >= 11) {
            getWindow().setFlags(0x01000000, 0x01000000);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (null == mUploadMessage) return;
            Uri result = intent == null || resultCode != RESULT_OK ? null : intent.getData();
            mUploadMessage.onReceiveValue(result);
            mUploadMessage = null;
        }
    }

    /**
     * Create and initialize web container with default web view objects.
     */
    @Override
    public void init() {
        CordovaWebView webView = new CordovaWebView(this);
        CordovaWebViewClient webViewClient;
        if (android.os.Build.VERSION.SDK_INT < 11) {
            webViewClient = new CordovaWebViewClient(this, webView);
        } else {
            webViewClient = new IceCreamCordovaWebViewClient(this, webView);
        }
        this.init(webView, webViewClient, new TiggziChromeClient(this, webView));
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        Log.d(TAG, "onNewIntent");
        setIntent(intent);

        PushNotifications.handleMessage(intent);
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "onStart");
        registerReceiver(mHandleMessageReceiver, new IntentFilter(Constants.DISPLAY_MESSAGE_ACTION));
    }

    @Override
    public void onStop() {
        super.onStop();
        unregisterReceiver(mHandleMessageReceiver);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        if (getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE) {
            // do nothing
        } else if (getResources().getConfiguration().orientation == Configuration.ORIENTATION_PORTRAIT) {
            // do your task
        }
        super.onConfigurationChanged(newConfig);

    }

    private String getStartFileName() {
        return "index.html";
    }

    @Override
    public void onBackPressed() {
        moveTaskToBack(true);
    }

    private final BroadcastReceiver mHandleMessageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            PushNotifications.handleMessage(intent);
        }
    };

    /**
     * This class is used to make <input type="file" ... /> work in APK *
     */
    public class TiggziChromeClient extends CordovaChromeClient {
        public TiggziChromeClient(CordovaInterface cordova) {
            super(cordova);
        }

        public TiggziChromeClient(CordovaInterface ctx, CordovaWebView app) {
            super(ctx, app);
        }

        public void openFileChooser(ValueCallback<Uri> uploadMsg) {
            openFileChooser(uploadMsg, DEFAULT_ACCEPT_TYPE);
        }

        public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType) {
            if (acceptType == null || acceptType.length() == 0) {
                acceptType = DEFAULT_ACCEPT_TYPE;
            }
            PhoneGapActivity.this.mUploadMessage = uploadMsg;
            Intent i = new Intent(Intent.ACTION_GET_CONTENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);
            i.setType(acceptType);
            PhoneGapActivity.this.startActivityForResult(Intent.createChooser(i, "File Chooser"),
                    PhoneGapActivity.FILECHOOSER_RESULTCODE);
        }

        public void openFileChooser(ValueCallback<Uri> uploadMsg, String acceptType, String capture) {
            openFileChooser(uploadMsg, acceptType);
        }
    }
}
