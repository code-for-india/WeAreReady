package com.phonegap.plugins.pushnotifications;

/**
 * Push constants.
 * 
 * @author ayakovenko
 * 
 */
public interface Constants {

    /**
     * Intent used to display a message in the screen.
     */
    public static final String DISPLAY_MESSAGE_ACTION = "io.appery.project178389.DISPLAY_MESSAGE";

    public interface EVENT {

        public static final String REGISTER = "REGISTER_EVENT";

        public static final String REGISTER_ERROR = "REGISTER_ERROR_EVENT";

        public static final String UNREGISTER = "UNREGISTER_EVENT";

        public static final String UNREGISTER_ERROR = "UNREGISTER_ERROR_EVENT";

        public static final String MESSAGE_RECEIVED = "MESSAGE_RECEIVED";
    }

    public interface ACTION {

        public static final String REGISTER = "registerDevice";

        public static final String UNREGISTER = "unregisterDevice";

        public static final String DEVICE_UID = "getDeviceUniqueIdentifier";
    }

    public interface EXTRA {

        /**
         * Intent's extra that contains the message to be displayed.
         */
        public static final String MESSAGE = "alert";

    }

    public interface NOTIFICATION {
        
        public static final String APS = "aps";
        
        public static final String ALERT = "alert";
    }

}
