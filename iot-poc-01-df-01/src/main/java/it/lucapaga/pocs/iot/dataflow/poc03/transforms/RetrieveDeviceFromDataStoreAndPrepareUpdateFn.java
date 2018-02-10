package it.lucapaga.pocs.iot.dataflow.poc03.transforms;

import org.apache.beam.sdk.transforms.DoFn;

import com.google.datastore.v1.Entity;

import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceDetails;

public class RetrieveDeviceFromDataStoreAndPrepareUpdateFn extends DoFn<DeviceDetails, Entity> {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ProcessElement
	public void processElement(ProcessContext c) {
		// no-op
	}
}
