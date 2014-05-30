/*
 * Copyright 2012 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.appery.project178389;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.util.Log;

import com.google.android.gcm.GCMBaseIntentService;
import com.phonegap.plugins.pushnotifications.Constants;
import com.phonegap.plugins.pushnotifications.gcm.PushManager;

/**
 * IntentService responsible for handling GCM messages.
 */
public class GCMIntentService extends GCMBaseIntentService {

    private final static String TAG = "GCMIntentService";

    public GCMIntentService() {
        super(PushManager.mSenderId);
    }

    @Override
    protected void onRegistered(Context context, String registrationId) {
        Log.d(TAG, "onRegistered: " + registrationId);
        displayMessage(context, Constants.EVENT.REGISTER, registrationId);
    }

    @Override
    protected void onUnregistered(Context context, String registrationId) {
        Log.d(TAG, "onUnregistered: " + registrationId);
        displayMessage(context, Constants.EVENT.UNREGISTER, registrationId);
    }

    @Override
    protected void onMessage(Context context, Intent intent) {
        Log.d(TAG, "onMessage");
        String message = intent.getExtras().getString(Constants.EXTRA.MESSAGE);

        displayMessage(context, Constants.EVENT.MESSAGE_RECEIVED, message);
        generateNotification(context, message);
    }

    @Override
    protected void onDeletedMessages(Context context, int total) {
        Log.d(TAG, "onDeletedMessages");
        String message = getString(R.string.gcm_deleted, total);
        generateNotification(context, message);
    }

    @Override
    public void onError(Context context, String errorId) {
        Log.d(TAG, "onError: " + errorId);
        displayMessage(context, Constants.EVENT.REGISTER_ERROR, errorId);
    }

    @Override
    protected boolean onRecoverableError(Context context, String errorId) {
        Log.d(TAG, "onRecoverableError: " + errorId);
        displayMessage(context, Constants.EVENT.REGISTER_ERROR, errorId);
        return super.onRecoverableError(context, errorId);
    }

    /**
     * Issues a notification to inform the user that server has sent a message.
     */
    @SuppressWarnings("deprecation")
    private static void generateNotification(Context context, String message) {
        if (PushManager.mAlert) {
            int icon = R.drawable.ic_stat_gcm;
            long when = System.currentTimeMillis();
            NotificationManager notificationManager = (NotificationManager) context
                    .getSystemService(Context.NOTIFICATION_SERVICE);
            Notification notification = new Notification(icon, message, when);
            String title = context.getString(R.string.app_name);
            Intent notificationIntent = new Intent(context, PhoneGapActivity.class);
            // set intent so it does not start a new activity
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            notificationIntent.putExtra(Constants.EVENT.MESSAGE_RECEIVED, message);

            PendingIntent intent = PendingIntent.getActivity(context, 0, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);
            notification.setLatestEventInfo(context, title, message, intent);
            if (PushManager.mSound) {
                notification.sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            notification.flags |= Notification.FLAG_AUTO_CANCEL;
            notificationManager.notify(0, notification);
        } else if (PushManager.mSound) {
            Uri ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            Ringtone ringtone = RingtoneManager.getRingtone(context, ringtoneUri);
            ringtone.play();
        }
    }

    /**
     * Notifies UI to display a message.
     * <p>
     * This method is defined in the common helper because it's used both by the UI and the background service.
     * 
     * @param context
     *            application's context.
     * @param message
     *            message to be displayed.
     */
    public static void displayMessage(Context context, String event, String message) {
        Intent intent = new Intent(Constants.DISPLAY_MESSAGE_ACTION);
        intent.putExtra(event, message);
        context.sendBroadcast(intent);
    }

}