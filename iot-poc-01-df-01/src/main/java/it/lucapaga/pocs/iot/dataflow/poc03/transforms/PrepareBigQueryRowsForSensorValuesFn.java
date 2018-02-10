package it.lucapaga.pocs.iot.dataflow.poc03.transforms;

import org.apache.beam.sdk.transforms.DoFn;

import com.google.api.services.bigquery.model.TableRow;

import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceDetails;
import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceIODetails;

public class PrepareBigQueryRowsForSensorValuesFn extends DoFn<DeviceDetails, TableRow> {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ProcessElement
	public void processElement(ProcessContext c) {
		System.out.println("[ CreateBigQueryStatusRecordFn       ] BQ TABLEROW CREATOR FOR STATUSES");
		DeviceDetails dm = c.element();
		if (dm == null) {
			System.out.println("[ CreateBigQueryStatusRecordFn       ] NULL 'DeviceMessage': NO-OP");
			return;
		}

		if (dm.getUnits() != null && dm.getUnits().size() > 0) {
			System.out.println(
					"[ CreateBigQueryStatusRecordFn       ] We have a not-null 'DeviceMessage' with not-null list of status-records");
			DeviceIODetails dd = dm.getUnits().iterator().next();

			System.out.println("[ CreateBigQueryStatusRecordFn       ] Creating TABLEROW for this");
			TableRow row = new TableRow();
			row.set("device_id", dm.getDevice_id());
			row.set("unit", dd.getUnit());
			row.set("unit_type", dd.getUnit_type());
			row.set("gpio_pin", dd.getGpio_pin());
			row.set("value", dd.getValue());
			row.set("tstamp", dm.getTs());
			c.output(row);
		} else {
			System.out.println(
					"[ CreateBigQueryStatusRecordFn       ] 'DeviceMessage' with null list of status-records: NO-OP");
			return;
		}
	}

}
