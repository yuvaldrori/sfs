package com.feller.picup.client;

import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.TextResource;

public interface UploadFrameResources extends ClientBundle {

	public static final UploadFrameResources INSTANCE =  GWT.create(UploadFrameResources.class);


	@Source("frame.properties")
	public TextResource getFrameTag();


};
