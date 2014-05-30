package com.phonegap.plugins.pushnotifications;

import java.util.HashMap;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.util.Log;

import com.google.android.gcm.GCMRegistrar;
import com.phonegap.plugins.pushnotifications.gcm.PushManager;

public class PushNotifications extends CordovaPlugin {

    private static final String TAG = "PushNotifications";

    private static CordovaWebView cWebView;

    private static HashMap<String, CallbackContext> callbackContexts = new HashMap<String, CallbackContext>();

    //If message is recieved before device is registered then message must be hold over
    //Here message of pended notification is stored.
    private static String pendingNotificationMessage = null;

    //Flag to trace if device is registered successfully (see "pendingNotificationMessage")
    private static boolean isRegistered = false;

    /**
     * Called when the activity receives a new intent.
     */
	/* 
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        Log.d(TAG, "onNewIntent");
        handleMessage(intent);
    }
	*/
    /*
     * (non-Javadoc)
     * 
     * @see org.apache.cordova.api.CordovaPlugin#execute(java.lang.String, org.json.JSONArray,
     * org.apache.cordova.api.CallbackContext)
     */
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "Plugin Called: " + action);
        cWebView = webView;

        if (Constants.ACTION.REGISTER.equals(action)) {
            callbackContexts.put(Constants.ACTION.REGISTER, callbackContext);

            JSONObject params = null;
            try {
                params = args.getJSONObject(0);
            } catch (JSONException e) {
                Log.d(TAG, Constants.ACTION.REGISTER, e);
                callbackContext.error("Invalid arguments");
                return true;
            }
            PushManager mPushManager = null;
            try {
                mPushManager = new PushManager(cordova.getActivity(), params.getBoolean("alert"),
                        params.getBoolean("badge"), params.getBoolean("sound"), params.getString("senderid"));
            } catch (JSONException e) {
                Log.d(TAG, Constants.ACTION.REGISTER, e);
                callbackContext.error("Can't create PUSH manager");
                return true;
            }

            try {
                mPushManager.onStartup(null, cordova.getActivity());
            } catch (java.lang.RuntimeException e) {
                Log.d(TAG, Constants.ACTION.REGISTER, e);
                callbackContext.error("Can't start PUSH manager");
                return true;
            }

            handleMessage(cordova.getActivity().getIntent());

            PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
            pluginResult.setKeepCallback(true);
            callbackContext.sendPluginResult(pluginResult);

            return true;
        } else if (Constants.ACTION.UNREGISTER.equals(action)) {
            callbackContexts.put(Constants.ACTION.UNREGISTER, callbackContext);

            try {
                GCMRegistrar.unregister(cordova.getActivity());
            } catch (Exception e) {
                Log.d(TAG, Constants.ACTION.UNREGISTER, e);
                callbackContext.error("Unregister error");
                return true;
            }

            PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
            pluginResult.setKeepCallback(true);
            callbackContext.sendPluginResult(pluginResult);

            return true;
        } else if (Constants.ACTION.DEVICE_UID.equals(action)) {
            callbackContexts.put(Constants.ACTION.DEVICE_UID, callbackContext);

            try {
                String uid = null;

                // Get device ID from Telephony Manager
                try {
                    TelephonyManager tm = (TelephonyManager) cordova.getActivity().getSystemService(
                            Context.TELEPHONY_SERVICE);
                    uid = tm.getDeviceId();
                } catch (Exception e) {
                }
                // Add Android ID
                uid += ";"
                        + Settings.Secure.getString(cordova.getActivity().getContentResolver(),
                                Settings.Secure.ANDROID_ID);
                callbackContext.success(uid);
            } catch (Exception e) {
                Log.d(TAG, Constants.ACTION.DEVICE_UID, e);
                callbackContext.error("Get device ID error");
                return true;
            }

            return true;
        }

        Log.d(TAG, "Invalid action : '" + action + "' passed");

        return false;
    }

    public static void handleMessage(Intent intent) {
        if (null != intent) {
            if (intent.hasExtra(Constants.EVENT.MESSAGE_RECEIVED)) {
                String notificationMessage = intent.getExtras().getString(Constants.EVENT.MESSAGE_RECEIVED);
                if(isRegistered) {
                    onMessageReceived(notificationMessage);
                }
                else {
                    pendingNotificationMessage = notificationMessage;
                }
            } else if (intent.hasExtra(Constants.EVENT.REGISTER)) {
                onRegistered(intent.getExtras().getString(Constants.EVENT.REGISTER));
            } else if (intent.hasExtra(Constants.EVENT.UNREGISTER)) {
                onUnregisterError(intent.getExtras().getString(Constants.EVENT.UNREGISTER));
            } else if (intent.hasExtra(Constants.EVENT.REGISTER_ERROR)) {
                onRegisterError(intent.getExtras().getString(Constants.EVENT.REGISTER_ERROR));
            } else if (intent.hasExtra(Constants.EVENT.UNREGISTER_ERROR)) {
                onUnregistered(intent.getExtras().getString(Constants.EVENT.UNREGISTER_ERROR));
            }
        }
    }

    public static void onRegistered(String registrationId) {
        JSONObject json = new JSONObject();
        try {
            json.put("deviceToken", registrationId);
        } catch (JSONException e) {
            Log.e(TAG, "onRegistered: Can't make JSON object for regId = " + registrationId);
        }
        doSuccess(Constants.ACTION.REGISTER, json);
        isRegistered = true;
        if(pendingNotificationMessage != null) {
            onMessageReceived(pendingNotificationMessage);
            pendingNotificationMessage = null;
        }
    }

    public static void onRegisterError(String errorId) {
        JSONObject json = new JSONObject();
        try {
            json.put("error", errorId);
        } catch (JSONException e) {
            Log.e(TAG, "onRegistered: Can't make JSON object for regId = " + errorId);
        }
        doError(Constants.ACTION.REGISTER, json);
        isRegistered = false;
    }

    public static void onUnregistered(String registrationId) {
        doSuccess(Constants.ACTION.UNREGISTER, registrationId);
        isRegistered = false;
    }

    public static void onUnregisterError(String errorId) {
        doError(Constants.ACTION.UNREGISTER, errorId);
    }

    public static void onMessageReceived(String message) {
        Log.d(TAG, "doOnMessageReceive: " + message);

        JSONObject json = new JSONObject();
        try {
            JSONObject aps = new JSONObject();
            aps.put(Constants.NOTIFICATION.ALERT, message);
            json.put(Constants.NOTIFICATION.APS, aps);
        } catch (JSONException e) {
        }

        String jsStatement = "(function() { " + "var jsStatement = " + json.toString() + "; "
                + "PushNotification.notificationCallback(jsStatement); " + "}) ();";

        if (cWebView == null) {
            Log.e(TAG, "onMessageReceived: cWebView is not set");
            return;
        }
        cWebView.sendJavascript(jsStatement);
    }

    private static void doSuccess(String action, String message) {
        Log.w(TAG, "Do success: " + action);
        CallbackContext callback = callbackContexts.get(action);
        if (callback != null) {
            callback.success(message);
        } else {
            Log.w(TAG, "Callback context not found for action: " + action);
        }
    }

    private static void doSuccess(String action, JSONObject json) {
        Log.w(TAG, "Do success: " + action);
        CallbackContext callback = callbackContexts.get(action);
        if (callback != null) {
            callback.success(json);
        } else {
            Log.w(TAG, "Callback context not found for action: " + action);
        }
    }

    private static void doError(String action, String message) {
        Log.w(TAG, "Do error: " + action);
        CallbackContext callback = callbackContexts.get(action);
        if (callback != null) {
            callback.error(message);
        } else {
            Log.w(TAG, "Callback context not found for action: " + action);
        }
    }

    private static void doError(String action, JSONObject json) {
        Log.w(TAG, "Do error: " + action);
        CallbackContext callback = callbackContexts.get(action);
        if (callback != null) {
            callback.error(json);
        } else {
            Log.w(TAG, "Callback context not found for action: " + action);
        }
    }

}
