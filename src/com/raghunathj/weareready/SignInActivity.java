package com.raghunathj.weareready;

import com.parse.LogInCallback;
import com.parse.Parse;
import com.parse.ParseException;
import com.parse.ParseUser;

import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

public class SignInActivity extends ActionBarActivity implements OnClickListener {

	Button bSignIn;
	EditText username,password;
	Spinner checkpoint;
	
	private AppPreference _config;
	
	protected ProgressDialog proDialog;
	
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.signin_layout);
		
		final ActionBar bar = getSupportActionBar();
		bar.setTitle("Login");
		
		_config = new AppPreference(this);
		String[] parseKeys = _config.getAppKeys("parse");
		Parse.initialize(this,parseKeys[0],parseKeys[1]);
		
		bSignIn = (Button) findViewById(R.id.bSignIn);
		bSignIn.setOnClickListener(this);
		
		checkpoint = (Spinner) findViewById(R.id.sCheckpoint);
		
		username = (EditText) findViewById(R.id.etUserName);
		password = (EditText) findViewById(R.id.etPassword);
	}


	@Override
	public void onClick(View v) {
		switch(v.getId()){
		case R.id.bSignIn:
			startLoading();
			ParseUser.logInInBackground(username.getText().toString(), password.getText().toString(), new LogInCallback() {
				
				@Override
				public void done(ParseUser user, ParseException e) {
					if(user!= null){
						//User is available
						_config.setCheckpoint(checkpoint.getSelectedItem().toString());
						Intent i = new Intent(SignInActivity.this,HomeActivity.class);
						startActivity(i);
						//Toast.makeText(getApplicationContext(),"Logged In",Toast.LENGTH_LONG).show();
					}else{
						//Invalid
						Toast.makeText(getApplicationContext(),"Invalid",Toast.LENGTH_LONG).show();
					}
					stopLoading();
				}
			});
			
		break;
		}
	}
	
	protected void startLoading() {
	    proDialog = new ProgressDialog(this);
	    proDialog.setMessage("Logging In...");
	    proDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
	    proDialog.setCancelable(false);
	    proDialog.show();
	}

	protected void stopLoading() {
	    proDialog.dismiss();
	    proDialog = null;
	}
	
	
	
	
}
