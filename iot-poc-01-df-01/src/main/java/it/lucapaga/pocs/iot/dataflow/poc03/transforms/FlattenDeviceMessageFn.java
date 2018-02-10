package it.lucapaga.pocs.iot.dataflow.poc03.transforms;

import java.util.ArrayList;

import org.apache.beam.sdk.transforms.DoFn;

import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceDetails;
import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceIODetails;

public class FlattenDeviceMessageFn extends DoFn<DeviceDetails, DeviceDetails> {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ProcessElement
	public void processElement(ProcessContext c) {
		DeviceDetails original = c.element();
		if(original != null && original.getUnits() != null && original.getUnits().size() > 0) {
			for (DeviceIODetails dd : original.getUnits()) {
				DeviceDetails ddNew = new DeviceDetails(original.getDevice_id(), new ArrayList<DeviceIODetails>(), original.getTs());
				ddNew.getUnits().add(dd);
				System.out.println("[ ParseDeviceMessageFn ] 'DeviceDetails' object deserialized, moving on");
				c.output(ddNew);
			}
		}
	}
}
