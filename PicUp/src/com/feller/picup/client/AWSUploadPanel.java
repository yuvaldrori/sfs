package com.feller.picup.client;


import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;
import com.google.gwt.user.client.ui.FlowPanel;
import com.google.gwt.user.client.ui.InlineHTML;



public class AWSUploadPanel extends FlowPanel {
	private String accessKey = "1NX81C7WVP4TCGTZKZ82";
	private String redirectUrl = "http://localhost/";
	
	public AWSUploadPanel(String accessKey) {
		super();
		this.accessKey = accessKey;
	}

	public AWSUploadPanel(String accessKey, String redirectUrl) {
		super();
		this.accessKey = accessKey;
		this.redirectUrl = redirectUrl;
	}
	
	public void addFrame()
	{
        this.add(new InlineHTML(UploadFrameResources.INSTANCE.getFrameTag().getText()));
	}
	

   
}
