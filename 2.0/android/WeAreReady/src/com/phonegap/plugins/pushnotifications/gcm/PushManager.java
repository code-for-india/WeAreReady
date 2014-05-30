package com.phonegap.plugins.pushnotifications.gcm;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;

import com.google.android.gcm.GCMRegistrar;
import com.phonegap.plugins.pushnotifications.Constants;
import io.appery.project178389.GCMIntentService;

public class PushManager {
    private final String TAG = "PushManager";

    // app id in the backend
    public volatile static String mSenderId = "";
    public volatile static boolean mAlert = false;
    volatile static boolean mBadge = false;
    public volatile static boolean mSound = false;

    AsyncTask<Void, Void, Void> mRegisterTask;

    // message id in the notification bar
    public static int MESSAGE_ID = 1001;

    private Context mContext;
    private Bundle mLastBundle;
    static Boolean sSimpleNotification;
    static SoundType sSoundType = SoundType.DEFAULT_MODE;
    static VibrateType sVibrateType = VibrateType.DEFAULT_MODE;

    private static final Object mSyncObj = new Object();
    private static AsyncTask<Void, Void, Void> mAsyncTask;

    PushManager(Context context) {
        checkNotNull(context, "context");
        mContext = context;
    }

    public PushManager(Context context, boolean alert, boolean badge, boolean sound, String senderId) {
        this(context);        
    }

    /**
     * @param savedInstanceState
     *            if this method calls in onCreate method, can be null
     * @param context
     *            current context
     */
    public void onStartup(Bundle savedInstanceState, Context context) {
        checkNotNull(mSenderId, "mSenderId");
        // Make sure the device has the proper dependencies.
        GCMRegistrar.checkDevice(context);
        // Make sure the manifest was properly set - comment out this line
        // while developing the app, then uncomment it when it's ready.
        GCMRegistrar.checkManifest(context);
        final String regId = GCMRegistrar.getRegistrationId(context);
        if (regId.equals("")) {
            // Automatically registers application on startup.
            GCMRegistrar.register(context, mSenderId);
        } else {
            // Skips registration.
            GCMIntentService.displayMessage(context, Constants.EVENT.REGISTER, GCMRegistrar.getRegistrationId(context));
//            PushEventsTransmitter.onRegistered(context, GCMRegistrar.getRegistrationId(context));
        }
    }

    /**
     * Note this will take affect only after PushGCMIntentService restart if it is already running
     */
    public void setMultiNotificationMode() {
        sSimpleNotification = false;
    }

    /**
     * Note this will take affect only after PushGCMIntentService restart if it is already running
     */
    public void setSimpleNotificationMode() {
        sSimpleNotification = true;
    }

    public void setSoundNotificationType(SoundType soundNotificationType) {
        sSoundType = soundNotificationType;
    }

    public void setVibrateNotificationType(VibrateType vibrateNotificationType) {
        sVibrateType = vibrateNotificationType;
    }

    private void checkNotNull(Object reference, String name) {
        if (reference == null) {
            throw new IllegalArgumentException(String.format("Please set the %1$s constant and recompile the app.",
                    name));
        }
    }

    public void unregister() {
        cancelPrevRegisterTask();

        GCMRegistrar.unregister(mContext);
    }

    private void cancelPrevRegisterTask() {
        synchronized (mSyncObj) {
            if (null != mAsyncTask) {
                mAsyncTask.cancel(true);
            }
            mAsyncTask = null;
        }
    }

    public String getCustomData() {
        if (mLastBundle == null) {
            return null;
        }

        String customData = (String) mLastBundle.get("u");
        return customData;
    }
}
