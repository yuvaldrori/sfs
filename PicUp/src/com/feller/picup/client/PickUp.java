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


/**
 * Entry point classes define <code>onModuleLoad()</code>.
 */
public class PickUp implements EntryPoint {
	//private String getBacketURL = "http://ec2-23-22-164-102.compute-1.amazonaws.com/event";
	private String getBacketURL = "http://localhost:80/event";
	private Label errorLabel = new Label("");
	private FlowPanel qrPannel = new FlowPanel();
	private AWSUploadPanel Uploadpanel = new AWSUploadPanel("a","b");
	

	public void onModuleLoad() {
		RootPanel rootPanel = RootPanel.get();

		VerticalPanel mainPanel = new VerticalPanel();
		rootPanel.add(mainPanel, 10, 10);
		mainPanel.setSize("391px", "193px");

		HorizontalPanel horizontalPanel = new HorizontalPanel();
		mainPanel.add(horizontalPanel);
		horizontalPanel.setSize("388px", "85px");

		Button getQRButton = new Button("get QR");
		getQRButton.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				getBucketURL();
			}
		});
		horizontalPanel.add(getQRButton);

		Button btnSendToBucket = new Button("send to Bucket");
		btnSendToBucket.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				generateUploadFrame();
			}
		});
		horizontalPanel.add(btnSendToBucket);


		horizontalPanel.add(errorLabel);
		
		
		mainPanel.add(qrPannel);
		qrPannel.setWidth("197px");
		
		
		mainPanel.add(Uploadpanel);
		Uploadpanel.setWidth("190px");

		Image picupImage = new Image("images/picUp.png");
		mainPanel.add(picupImage);
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
		qrPannel.add(new InlineHTML(imgTag));	
	}

	protected native void urlToQR(String text)/*-{

	  var qr = $wnd.qrcode(4,'M');
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
	protected void displayError(String string) {

		Date d = new Date();
		errorLabel.setText(string + " - " + d.toLocaleString() + getBacketURL);
		
		//decode the barcode
		QRCodeReader reader = new QRCodeReader();
//		if (reader == null)
//		{
//			errorLabel.setText("a");
//		}
	}
}
