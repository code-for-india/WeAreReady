package com.raghunathj.weareready;

import com.parse.ParseException;
import com.parse.ParseObject;
import com.parse.SaveCallback;

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

public class CreateActivity extends ActionBarActivity implements OnClickListener {
	
	EditText firstName,lastName,age,phone,emergencyName,emergencyNumber,city;
	Spinner gender;
	Button create;
	String tagid = null;
	Bundle extras = null;
	protected ProgressDialog proDialog;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);
		setContentView(R.layout.create_layout);
		final ActionBar bar = getSupportActionBar();
		bar.setTitle("Create User");
		extras = getIntent().getExtras();
		if(extras != null){
			tagid = extras.getString("tagid");
		}
		firstName = (EditText) findViewById(R.id.etFirstName);
		lastName = (EditText) findViewById(R.id.etLastName);
		age = (EditText) findViewById(R.id.etAge);
		phone = (EditText) findViewById(R.id.etPhone);
		emergencyName = (EditText) findViewById(R.id.etEmergencyName);
		emergencyNumber = (EditText) findViewById(R.id.etEmergencyPhone);
		city = (EditText) findViewById(R.id.etCity);
		create = (Button) findViewById(R.id.bCreate);
		gender = (Spinner) findViewById(R.id.sGender);
		create.setOnClickListener(this);
		
	}

	@Override
	public void onClick(View v) {
		switch(v.getId()){
		case R.id.bCreate:
			ParseObject o = new ParseObject("people");
			o.put("tagid",tagid);
			o.put("firstname",firstName.getText().toString());
			o.put("lastname",lastName.getText().toString());
			o.put("age",age.getText().toString());
			o.put("phone",phone.getText().toString());
			o.put("emergencyName",emergencyName.getText().toString());
			o.put("emergencyPhone",emergencyNumber.getText().toString());
			o.put("city",city.getText().toString());
			o.put("gender",gender.getSelectedItem());
			startLoading();
			o.saveInBackground(new SaveCallback() {
				
				@Override
				public void done(ParseException e) {
					stopLoading();
					Intent i = new Intent(CreateActivity.this,HomeActivity.class);
					startActivity(i);
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
