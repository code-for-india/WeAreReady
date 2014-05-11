package com.raghunathj.weareready;

import com.parse.Parse;
import com.parse.ParseUser;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

public class HomeActivity extends ActionBarActivity implements OnClickListener {
	
	Button create,scan;
	private AppPreference _config;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.home_layout);
		_config = new AppPreference(this);
		String[] parseKeys = _config.getAppKeys("parse");
		Parse.initialize(this,parseKeys[0],parseKeys[1]);
		
		create = (Button) findViewById(R.id.bCreate);
		scan = (Button) findViewById(R.id.bScan);
		
		create.setVisibility(View.INVISIBLE);
		
		String role = ParseUser.getCurrentUser().get("role").toString();
		if(role.equals("Administrator")){
			create.setVisibility(View.VISIBLE);
		}
		
		create.setOnClickListener(this);
		scan.setOnClickListener(this);
		
	}

	@Override
	public void onClick(View v) {
		switch(v.getId()){
		case R.id.bCreate:
			Bundle c = new Bundle();
			c.putString("scanmode","create");
			Intent i = new Intent(getApplicationContext(),TagViewer.class);
			i.putExtras(c);
			startActivity(i);
		break;
		case R.id.bScan:
			Bundle b = new Bundle();
			b.putString("scanmode","normal");
			Intent j = new Intent(getApplicationContext(),TagViewer.class);
			j.putExtras(b);
			startActivity(j);
		break;
		}
	}
	
}
