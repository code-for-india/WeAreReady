package com.raghunathj.weareready;

import com.parse.Parse;
import com.parse.ParseException;
import com.parse.ParseUser;
import com.parse.SignUpCallback;

import android.app.ProgressDialog;
import android.os.Bundle;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

public class RegisterActivity extends ActionBarActivity implements OnClickListener {
	
	Button signUp;
	EditText username,password,email,fullname;
	Spinner role;
	private AppPreference _config;
	
	protected ProgressDialog proDialog;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.register_layout);
		final ActionBar bar = getSupportActionBar();
		bar.setTitle("Sign Up");
		
		_config = new AppPreference(this);
		String[] parseKeys = _config.getAppKeys("parse");
		Parse.initialize(this,parseKeys[0],parseKeys[1]);
		signUp = (Button) findViewById(R.id.bSignUp);
		username = (EditText) findViewById(R.id.etUserName);
		password = (EditText) findViewById(R.id.etPassword);
		email = (EditText) findViewById(R.id.etEmail);
		fullname = (EditText) findViewById(R.id.etFullName);
		
		role = (Spinner) findViewById(R.id.sRole);
		
		
		signUp.setOnClickListener(this);
	}

	@Override
	public void onClick(View v) {
		switch(v.getId()){
		case R.id.bSignUp:
			String u = username.getText().toString();
			String p = password.getText().toString();
			String e = email.getText().toString();
			String f = fullname.getText().toString();
			String r = role.getSelectedItem().toString();
			
			//Save in Parse
			ParseUser user = new ParseUser();
			user.setUsername(u);
			user.setPassword(p);
			user.put("name",f);
			user.setEmail(e);
			user.put("role",r);
			
			startLoading();
			user.signUpInBackground(new SignUpCallback() {
				
				@Override
				public void done(ParseException e) {
					if(e==null){
						ParseUser currentUser = ParseUser.getCurrentUser();
						String parseId = currentUser.getObjectId();
						Toast.makeText(getApplicationContext(),"Account Created",Toast.LENGTH_LONG).show();
						stopLoading();
					}else{
						stopLoading();
						Toast.makeText(getApplicationContext(),"Unable to create account at this time",Toast.LENGTH_LONG).show();
						Log.i("ERROR",e.toString());
					}
				}
			});
			
		break;
		
		}
	}
	
	protected void startLoading() {
	    proDialog = new ProgressDialog(this);
	    proDialog.setMessage("Creating Account...");
	    proDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
	    proDialog.setCancelable(false);
	    proDialog.show();
	}

	protected void stopLoading() {
	    proDialog.dismiss();
	    proDialog = null;
	}

}
