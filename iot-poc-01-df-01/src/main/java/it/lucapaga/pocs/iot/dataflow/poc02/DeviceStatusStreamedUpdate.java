/**
* 
*/
package it.lucapaga.pocs.iot.dataflow.poc02;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.extensions.gcp.options.GcpOptions;
import org.apache.beam.sdk.io.gcp.bigquery.BigQueryIO;
import org.apache.beam.sdk.io.gcp.pubsub.PubsubIO;
import org.apache.beam.sdk.io.gcp.pubsub.PubsubMessage;
import org.apache.beam.sdk.options.Default;
import org.apache.beam.sdk.options.DefaultValueFactory;
import org.apache.beam.sdk.options.Description;
import org.apache.beam.sdk.options.PipelineOptions;
import org.apache.beam.sdk.options.PipelineOptionsFactory;
import org.apache.beam.sdk.transforms.DoFn;
import org.apache.beam.sdk.transforms.ParDo;
import org.apache.beam.sdk.values.PCollection;

import com.google.api.services.bigquery.model.TableFieldSchema;
import com.google.api.services.bigquery.model.TableRow;
import com.google.api.services.bigquery.model.TableSchema;
import com.google.gson.Gson;

/**
 * @author pagaclaire
 *
 */
public class DeviceStatusStreamedUpdate {

	public interface DeviceStatusStreamedUpdateOptions extends GcpOptions {
		@Description("Pub/Sub STATUS topic")
		// @Default.InstanceFactory(PubsubTopicFactory.class)
//		@Default.String("projects/luca-paganelli-formazione/topics/gpio_status_topic")
		String getPubsubTopic();

		void setPubsubTopic(String topicName);

		@Description("Pub/Sub STATUS subscription")
		// @Default.InstanceFactory(PubsubTopicFactory.class)
//		@Default.String("projects/luca-paganelli-formazione/subscriptions/dataflow-generic")
		String getPubsubSubscription();

		void setPubsubSubscription(String subscriptionName);

		/**
		 * Returns a default Pub/Sub topic based on the project and the job
		 * names.
		 */
		class PubsubTopicFactory implements DefaultValueFactory<String> {
			@Override
			public String create(PipelineOptions options) {
				return "projects/" + options.as(GcpOptions.class).getProject() + "/topics/" + options.getJobName();
			}
		}

		@Description("BQ TABLE SCHEMA")
		@Default.String("IOT_POC_01")
		String getBigQuerySchema();

		void setBigQuerySchema(String s);

		@Description("BQ TABLE FOR VALUES")
		@Default.String("PI_VALUES")
		String getBigQueryTableForValues();

		void setBigQueryTableForValues(String s);

		@Description("BQ TABLE FOR STATUSES")
		@Default.String("PI_STATUSES")
		String getBigQueryTableForStatuses();

		void setBigQueryTableForStatuses(String s);
	}

	private static class DeviceIOStatus implements Serializable {
		private static final long serialVersionUID = 1L;

		public String unit = null;
		public String unit_type = null;
		public Double value = null;
		public String status = null;
		public Integer gpio_pin = null;

		public DeviceIOStatus(String unit, String unit_type, Double value, String status, Integer gpio_pin) {
			super();
			this.unit = unit;
			this.unit_type = unit_type;
			this.value = value;
			this.status = status;
			this.gpio_pin = gpio_pin;
		}
	}

	private static class DeviceMessage implements Serializable {
		private static final long serialVersionUID = 1L;

		public String device_id = null;
		public List<DeviceIOStatus> units = null;
		public Long ts = null;

		public DeviceMessage(String device_id, List<DeviceIOStatus> units, Long ts) {
			super();
			this.device_id = device_id;
			this.units = units;
			this.ts = ts;
		}
	}

	static class ParseAndDeserializePubsubMessageFn extends DoFn<PubsubMessage, DeviceMessage> {
		@ProcessElement
		public void processElement(ProcessContext c) {
			System.out.println("[ ParseAndDeserializePubsubMessageFn ] PUBSUB INGESTOR");
			String jsonMessage = new String(c.element().getPayload());
			System.out.println("[ ParseAndDeserializePubsubMessageFn ] Message Coming from PUB/SUB: " + jsonMessage);
			Gson g = new Gson();
			DeviceMessage dm = g.fromJson(jsonMessage, DeviceMessage.class);
			System.out.println("[ ParseAndDeserializePubsubMessageFn ] 'DeviceMessage' object deserialized, moving on");
			c.output(dm);
		}
	}

	static class CreateBigQueryValueRecordFn extends DoFn<DeviceMessage, TableRow> {
		@ProcessElement
		public void processElement(ProcessContext c) {
			System.out.println("[ CreateBigQueryValueRecordFn        ] BQ TABLEROW CREATOR FOR VALUES");
			DeviceMessage dm = c.element();
			if (dm == null) {
				System.out.println("[ CreateBigQueryValueRecordFn        ] NULL 'DeviceMessage': NO-OP");
				return;
			}

			if (dm.units != null) {
				System.out.println("[ CreateBigQueryValueRecordFn        ] We have a not-null 'DeviceMessage' with not-null list of status-records");
				for (DeviceIOStatus aStatus : dm.units) {
					System.out.println("[ CreateBigQueryValueRecordFn        ] Processing one status-record, type=" + aStatus.unit_type);
					if ("sensor".equalsIgnoreCase(aStatus.unit_type)) {
						System.out.println("[ CreateBigQueryValueRecordFn        ] Creating TABLEROW for this");
						TableRow row = new TableRow();
						row.set("device_id", dm.device_id);
						row.set("unit", aStatus.unit);
						row.set("unit_type", aStatus.unit_type);
						row.set("gpio_pin", aStatus.gpio_pin);
						row.set("value", aStatus.value);
						row.set("tstamp", dm.ts);
						c.output(row);
					} else {
						System.out.println("[ CreateBigQueryValueRecordFn        ] This won't be processed by me!");
					}
				}
			} else {
				System.out.println("[ CreateBigQueryValueRecordFn        ] 'DeviceMessage' with null list of status-records: NO-OP");
				return;
			}
		}

		/**
		 * Defines the BigQuery schema used for the output.
		 */
		static TableSchema getSchema() {
			List<TableFieldSchema> fields = new ArrayList<>();
			fields.add(new TableFieldSchema().setName("device_id").setType("STRING"));
			fields.add(new TableFieldSchema().setName("unit").setType("STRING"));
			fields.add(new TableFieldSchema().setName("unit_type").setType("STRING"));
			fields.add(new TableFieldSchema().setName("gpio_pin").setType("INTEGER"));
			fields.add(new TableFieldSchema().setName("value").setType("FLOAT"));
			fields.add(new TableFieldSchema().setName("tstamp").setType("FLOAT"));
			TableSchema schema = new TableSchema().setFields(fields);
			return schema;
		}
	}

	static class CreateBigQueryStatusRecordFn extends DoFn<DeviceMessage, TableRow> {
		@ProcessElement
		public void processElement(ProcessContext c) {
			System.out.println("[ CreateBigQueryStatusRecordFn       ] BQ TABLEROW CREATOR FOR STATUSES");
			DeviceMessage dm = c.element();
			if (dm == null) {
				System.out.println("[ CreateBigQueryStatusRecordFn       ] NULL 'DeviceMessage': NO-OP");
				return;
			}

			if (dm.units != null) {
				System.out.println("[ CreateBigQueryStatusRecordFn       ] We have a not-null 'DeviceMessage' with not-null list of status-records");
				for (DeviceIOStatus aStatus : dm.units) {
					System.out.println("[ CreateBigQueryStatusRecordFn       ] Processing one status-record, type=" + aStatus.unit_type);
					if ("led".equalsIgnoreCase(aStatus.unit_type)) {
						System.out.println("[ CreateBigQueryStatusRecordFn       ] Creating TABLEROW for this");
						TableRow row = new TableRow();
						row.set("device_id", dm.device_id);
						row.set("unit", aStatus.unit);
						row.set("unit_type", aStatus.unit_type);
						row.set("gpio_pin", aStatus.gpio_pin);
						row.set("status", aStatus.status);
						row.set("tstamp", dm.ts);
						c.output(row);
					} else {
						System.out.println("[ CreateBigQueryStatusRecordFn       ] This won't be processed by me!");
					}
				}
			} else {
				System.out.println("[ CreateBigQueryStatusRecordFn       ] 'DeviceMessage' with null list of status-records: NO-OP");
				return;
			}
		}

		/**
		 * Defines the BigQuery schema used for the output.
		 */
		static TableSchema getSchema() {
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

	public static void main(String[] args) {
		DeviceStatusStreamedUpdateOptions options = PipelineOptionsFactory.fromArgs(args).withValidation()
				.as(DeviceStatusStreamedUpdateOptions.class);
		Pipeline p = Pipeline.create(options);

		PCollection<PubsubMessage> pubsub = null;
		if (options.getPubsubSubscription() != null && !"".equals(options.getPubsubSubscription())) {
			pubsub = p.apply("PubsubIngestorOnExistingSubscription",
					PubsubIO.readMessagesWithAttributes().fromSubscription(options.getPubsubSubscription()));
		} else {
			pubsub = p.apply("PubsubIngestorOnTopic", PubsubIO.readMessagesWithAttributes().fromTopic(options.getPubsubTopic()));
		}

		PCollection<DeviceMessage> jsonMSG = pubsub.apply("DeviceMessageParser",
				ParDo.of(new ParseAndDeserializePubsubMessageFn()));
		PCollection<TableRow> bqValueRecords = jsonMSG.apply("Values_BigQueryRecordBuilder",
				ParDo.of(new CreateBigQueryValueRecordFn()));
		bqValueRecords.apply("Values_BigQueryRecordSaver", BigQueryIO.writeTableRows()
				.to(options.getProject() + ":" + options.getBigQuerySchema() + "."
						+ options.getBigQueryTableForValues())
				.withSchema(CreateBigQueryValueRecordFn.getSchema())
				.withWriteDisposition(BigQueryIO.Write.WriteDisposition.WRITE_APPEND)
				.withCreateDisposition(BigQueryIO.Write.CreateDisposition.CREATE_IF_NEEDED));
		PCollection<TableRow> bqStatusRecords = jsonMSG.apply("Statuses_BigQueryRecordBuilder",
				ParDo.of(new CreateBigQueryStatusRecordFn()));
		bqStatusRecords.apply("Statuses_BigQueryRecordSaver", BigQueryIO.writeTableRows()
				.to(options.getProject() + ":" + options.getBigQuerySchema() + "."
						+ options.getBigQueryTableForStatuses())
				.withSchema(CreateBigQueryStatusRecordFn.getSchema())
				.withWriteDisposition(BigQueryIO.Write.WriteDisposition.WRITE_APPEND)
				.withCreateDisposition(BigQueryIO.Write.CreateDisposition.CREATE_IF_NEEDED));

		p.run().waitUntilFinish();
	}

}
