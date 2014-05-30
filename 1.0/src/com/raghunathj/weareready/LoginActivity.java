package com.raghunathj.weareready;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

public class LoginActivity extends Activity implements OnClickListener {
	
	Button bAdmin,bManager,bRegister;
	Bundle b = new Bundle();

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onCreate(savedInstanceState);
		setContentView(R.layout.login_activity);
		bAdmin = (Button) findViewById(R.id.bAdminLogin);
		bManager = (Button) findViewById(R.id.bManagerLogin);
		bRegister = (Button) findViewById(R.id.bRegister);
		
		bAdmin.setOnClickListener(this);
		bManager.setOnClickListener(this);
		
		bRegister.setOnClickListener(this);
		
		
		
	}

	@Override
	public void onClick(View v) {
		switch(v.getId()){
		case R.id.bAdminLogin:
			//Toast.makeText(this,"Admin Login",Toast.LENGTH_LONG).show();
			b.putBoolean("loginAsAdmin",true);
			Intent i = new Intent(LoginActivity.this,SignInActivity.class);
			i.putExtras(b);
			startActivity(i);
			break;
		case R.id.bManagerLogin:
			b.putBoolean("loginAsAdmin",false);
			Intent j = new Intent(LoginActivity.this,SignInActivity.class);
			j.putExtras(b);
			startActivity(j);
			break;
		case R.id.bRegister:
			Intent k = new Intent(LoginActivity.this,RegisterActivity.class);
			startActivity(k);
			break;
		}
	}
	
	

	
	
}
