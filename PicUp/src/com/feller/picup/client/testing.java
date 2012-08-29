package com.feller.picup.client;

import java.util.Map;

public class testing {
	int x;
	float y;
	Map<Integer,String> m;
	
	public testing(int x, float y) {
		super();
		this.x = x;
		this.y = y;
	}
	
	public int getX()
	{
		if(m.isEmpty())
			return x;
		else
			return x+1;
	}
	

}
