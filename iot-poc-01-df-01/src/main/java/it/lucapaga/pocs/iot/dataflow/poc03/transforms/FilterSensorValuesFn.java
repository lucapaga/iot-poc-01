package it.lucapaga.pocs.iot.dataflow.poc03.transforms;

import org.apache.beam.sdk.transforms.DoFn;

import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceDetails;
import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceIODetails;

public class FilterSensorValuesFn extends DoFn<DeviceDetails, DeviceDetails> {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ProcessElement
	public void processElement(ProcessContext c) {
		DeviceDetails original = c.element();
		if (original != null && original.getUnits() != null && original.getUnits().size() > 0) {
			DeviceIODetails ddd = original.getUnits().iterator().next();
			if (DeviceIODetails.UNIT_TYPES_SENSOR.equalsIgnoreCase(ddd.getUnit_type())) {
				c.output(original);
			}
		}
	}
}
