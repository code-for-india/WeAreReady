package com.raghunathj.weareready;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;

public class AppPreference {
	
	private static final String APP_SHARED_PREFS = AppPreference.class.getSimpleName();
	private SharedPreferences _sharedPrefs;
    private Editor _prefsEditor;
    
    public AppPreference(Context context) {
    	this._sharedPrefs = context.getSharedPreferences(APP_SHARED_PREFS, Activity.MODE_PRIVATE);
        this._prefsEditor = _sharedPrefs.edit();
    }
    
    public String[] getAppKeys(String keytype){
    	if(keytype.equals("parse")){
    		String data = _sharedPrefs.getString("parsekey","kurw0BJ3eV1g6tGjsi1XJfhcZaK6gz1Jt4qOmYfC,j7aui45yT4IgTh31it8BnD3MWzHnsu1bcTHtFWRW");
    		return data.split(",");
    	}
    	return null;
    }
    
    public String getCheckpoint(){
    	return _sharedPrefs.getString("checkpoint","");
    }
    
    public void setCheckpoint(String point){
    	if(!point.equals("")){
    		_prefsEditor.putString("checkpoint", point);
        	_prefsEditor.commit();
    	}
    }

}
