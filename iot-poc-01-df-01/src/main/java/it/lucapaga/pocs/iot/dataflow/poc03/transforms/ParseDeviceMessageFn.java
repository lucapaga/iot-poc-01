package it.lucapaga.pocs.iot.dataflow.poc03.transforms;

import org.apache.beam.sdk.io.gcp.pubsub.PubsubMessage;
import org.apache.beam.sdk.transforms.DoFn;

import com.google.gson.Gson;

import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceDetails;

public class ParseDeviceMessageFn extends DoFn<PubsubMessage, DeviceDetails> {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ProcessElement
	public void processElement(ProcessContext c) {
		String jsonMessage = new String(c.element().getPayload());
		System.out.println("[ ParseDeviceMessageFn ] Message Coming from PUB/SUB: " + jsonMessage);
		try {
			Gson g = new Gson();
			DeviceDetails dm = g.fromJson(jsonMessage, DeviceDetails.class);
			System.out.println("[ ParseDeviceMessageFn ] 'DeviceDetails' object deserialized, moving on");
			c.output(dm);			
		} catch (Exception e) {
			System.out.println("[ ParseDeviceMessageFn ] Unable to handle this message: " + e.getMessage());
		}
	}
}
