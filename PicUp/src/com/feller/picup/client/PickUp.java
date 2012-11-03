/*******************************************************************************
 * Copyright 2011 Google Inc. All Rights Reserved.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
package com.feller.picup.client;

import java.util.Date;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.http.client.Request;
import com.google.gwt.http.client.RequestBuilder;
import com.google.gwt.http.client.RequestCallback;
import com.google.gwt.http.client.RequestException;
import com.google.gwt.http.client.Response;
import com.google.gwt.http.client.URL;
import com.google.gwt.user.client.ui.Button;
import com.google.gwt.user.client.ui.RootPanel;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.FlowPanel;
import com.google.gwt.user.client.ui.InlineHTML;
import com.google.gwt.user.client.ui.FileUpload;
import com.google.gwt.user.client.ui.TabPanel;


/**
 * Entry point classes define <code>onModuleLoad()</code>.
 */
public class PickUp implements EntryPoint {
	//private String getBacketURL = "http://ec2-23-22-164-102.compute-1.amazonaws.com/event";
	private String getBacketURL = "http://localhost:80/event";
	private Label errorLabel = new Label("");
	private Label uploadLabel = new Label("");
	private FlowPanel QRImagePanel = new FlowPanel();
	private AWSUploadPanel Uploadpanel = new AWSUploadPanel("a","b");
	private FileUpload fileUpload = new FileUpload();
	private TabPanel tabPanel = new TabPanel();


	public void onModuleLoad() {
		RootPanel rootPanel = RootPanel.get();

		
		tabPanel.setVisible(true);
		tabPanel.setAnimationEnabled(true);
		rootPanel.add(tabPanel, 0, 85);
		tabPanel.setSize("561px", "343px");
		tabPanel.add(Uploadpanel, "Upload Pics", false);
		Uploadpanel.setSize("296px", "290px");
		Uploadpanel.add(uploadLabel);
		Uploadpanel.add(fileUpload);
		fileUpload.setName("files[]");

		VerticalPanel generateQRPanel = new VerticalPanel();
		tabPanel.add(generateQRPanel, "Generate QR Code", false);
		tabPanel.selectTab(0);
		
		generateQRPanel.setSize("5cm", "3cm");

		HorizontalPanel ButtonslPanel = new HorizontalPanel();
		generateQRPanel.add(ButtonslPanel);
		ButtonslPanel.setSize("218px", "36px");

		Button getQRButton = new Button("get QR");
		getQRButton.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				getBucketURL();
			}
		});
		ButtonslPanel.add(getQRButton);

		Button btnSendToBucket = new Button("send to Bucket");
		btnSendToBucket.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				generateUploadFrame();
			}
		});
		ButtonslPanel.add(btnSendToBucket);


		ButtonslPanel.add(errorLabel);


		generateQRPanel.add(QRImagePanel);
		QRImagePanel.setWidth("197px");

		Image picupImage = new Image("images/picUp.png");
		rootPanel.add(picupImage, 7, 10);
		fileUpload.getElement().setId("files");

		if(!initQRcodeDecoderComponenets())
		{
			uploadLabel.setText("your browser does not support html5 capabilities.\n " +
					"QR decoding won't work \n" +
					"try using FireFox or chrome browser");
		}
		else
		{
			uploadLabel.setText("html5 capabilites are supported");
		}

		initFileReaderCallbacks(this);
	}



	protected void generateUploadFrame() {
		Uploadpanel.addFrame();

	}

	protected void getBucketURL() {
		RequestBuilder builder = new RequestBuilder(RequestBuilder.GET, URL.encode(getBacketURL));

		try {
			Request request = builder.sendRequest(null, new RequestCallback() {
				public void onError(Request request, Throwable exception) {
					displayError("Couldn't retrieve JSON ::" + exception.getMessage());
				}

				public void onResponseReceived(Request request, Response response) {
					if (200 == response.getStatusCode()) {

						urlToQR(response.getText());
					} else {
						displayError("couldn't retrieve JSON (" + response.getStatusCode()
								+ ")");
					}
				}
			});
		} catch (RequestException e) {
			displayError("exception: Couldn't retrieve JSON" + e.getMessage());
		}

	}

	public void addQRImg(String imgTag)
	{
		QRImagePanel.add(new InlineHTML(imgTag));	
	}

	protected native boolean initQRcodeDecoderComponenets()/*-{
		function analyze(a)
		{
	   		alert(a);
		}

		function isCanvasSupported(){
  			var elem = document.createElement('canvas');
			return !!(elem.getContext && elem.getContext('2d'));
		}

		if(isCanvasSupported() && window.File && window.FileReader)
		{
			$wnd.qrcode.callback = analyze;
			return true;
		}
		else
		{
			return false;
		}



	}-*/;


	protected native void urlToQR(String text)/*-{

	  var qr = $wnd.genQRcode(4,'M');
	  if(qr != null)
	  {
	  	qr.addData(text);
	  	qr.make();
	  	var img = qr.createImgTag();

	  	if(img != null)
	  	{
	  		this.@com.feller.picup.client.PickUp::addQRImg(Ljava/lang/String;)(img);
	  	}
	  }

	}-*/;

	protected native void initFileReaderCallbacks(PickUp obj)/*-{

		function handleFileSelect(evt) {
	    var files = evt.target.files; // FileList object
	    for (var i = 0, f; f = files[i]; i++) {

	      // Only process image files.
	      if (!f.type.match('image.*')) {
	      	alert(f.name + ' is not an image!');
	        continue;
	      }

	      var reader = new FileReader();

	      // Closure to capture the file information.
	      reader.onload = (function(theFile) {
	        return function(e) {
	           $wnd.qrcode.decode(e.target.result);
	        };
	      })(f);

	      // Read in the image file as a data URL.
	      reader.readAsDataURL(f);
	    }
	  }

  	  $wnd.files.addEventListener('change', handleFileSelect, false);

	}-*/;

	protected void displayError(String string) {

		Date d = new Date();
		errorLabel.setText(string + " - " + d.toLocaleString() + getBacketURL);
	}
}
