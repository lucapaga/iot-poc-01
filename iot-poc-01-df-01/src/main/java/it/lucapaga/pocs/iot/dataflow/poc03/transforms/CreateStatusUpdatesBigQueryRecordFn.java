package it.lucapaga.pocs.iot.dataflow.poc03.transforms;

import java.util.ArrayList;
import java.util.List;

import org.apache.beam.sdk.transforms.DoFn;

import com.google.api.services.bigquery.model.TableFieldSchema;
import com.google.api.services.bigquery.model.TableRow;
import com.google.api.services.bigquery.model.TableSchema;

import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceDetails;
import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceIODetails;

public class CreateStatusUpdatesBigQueryRecordFn extends DoFn<DeviceDetails, TableRow> {
	@ProcessElement
	public void processElement(ProcessContext c) {
		System.out.println("[ CreateBigQueryStatusRecordFn       ] BQ TABLEROW CREATOR FOR STATUSES");
		DeviceDetails dm = c.element();
		if (dm == null) {
			System.out.println("[ CreateBigQueryStatusRecordFn       ] NULL 'DeviceMessage': NO-OP");
			return;
		}

		if (dm.getUnits() != null) {
			System.out.println(
					"[ CreateBigQueryStatusRecordFn       ] We have a not-null 'DeviceMessage' with not-null list of status-records");
			for (DeviceIODetails aStatus : dm.getUnits()) {
				System.out.println("[ CreateBigQueryStatusRecordFn       ] Processing one status-record, type="
						+ aStatus.getUnit_type());
				if ("led".equalsIgnoreCase(aStatus.getUnit_type())) {
					System.out.println("[ CreateBigQueryStatusRecordFn       ] Creating TABLEROW for this");
					TableRow row = new TableRow();
					row.set("device_id", dm.getDevice_id());
					row.set("unit", aStatus.getUnit());
					row.set("unit_type", aStatus.getUnit_type());
					row.set("gpio_pin", aStatus.getGpio_pin());
					row.set("status", aStatus.getStatus());
					row.set("tstamp", dm.getTs());
					c.output(row);
				} else {
					System.out.println("[ CreateBigQueryStatusRecordFn       ] This won't be processed by me!");
				}
			}
		} else {
			System.out.println(
					"[ CreateBigQueryStatusRecordFn       ] 'DeviceMessage' with null list of status-records: NO-OP");
			return;
		}
	}

	/**
	 * Defines the BigQuery schema used for the output.
	 */
	public static TableSchema getSchema() {
		List<TableFieldSchema> fields = new ArrayList<>();
		fields.add(new TableFieldSchema().setName("device_id").setType("STRING"));
		fields.add(new TableFieldSchema().setName("unit").setType("STRING"));
		fields.add(new TableFieldSchema().setName("unit_type").setType("STRING"));
		fields.add(new TableFieldSchema().setName("gpio_pin").setType("INTEGER"));
		fields.add(new TableFieldSchema().setName("status").setType("STRING"));
		fields.add(new TableFieldSchema().setName("tstamp").setType("FLOAT"));
		TableSchema schema = new TableSchema().setFields(fields);
		return schema;
	}
}
