/**
 * 
 */
package it.lucapaga.pocs.iot.dataflow.poc02;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.extensions.gcp.options.GcpOptions;
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
		@Default.InstanceFactory(PubsubTopicFactory.class)
		@Default.String("projects/luca-paganelli-formazione/topics/gpio_status_topic")
		String getPubsubTopic();

		void setPubsubTopic(String topicName);

		@Description("Pub/Sub STATUS subscription")
		@Default.InstanceFactory(PubsubTopicFactory.class)
		@Default.String("projects/luca-paganelli-formazione/subscriptions/dataflow-generic")
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
	}

	private static class DeviceMessage implements Serializable {
		public String deviceId = null;
		
		public DeviceMessage(String deviceId) {
			this.deviceId = deviceId;
		}
	}
	
	
	static class ParseAndDeserializePubsubMessageFn extends DoFn<PubsubMessage, DeviceMessage> {
		@ProcessElement
		public void processElement(ProcessContext c) {
			String jsonMessage = new String(c.element().getPayload());
			System.out.println("Da message: " + jsonMessage);
			Gson g = new Gson();
			DeviceMessage dm = g.fromJson(jsonMessage, DeviceMessage.class);
			c.output(dm);
		}
	}
	
	static class CreateBigQueryRecordFn extends DoFn<DeviceMessage, TableRow> {
		@ProcessElement
		public void processElement(ProcessContext c) {
			DeviceMessage dm = c.element();
			TableRow row = new TableRow().set("device_id", dm.deviceId);
			c.output(row);
		}

		/**
		 * Defines the BigQuery schema used for the output.
		 */
		static TableSchema getSchema() {
			List<TableFieldSchema> fields = new ArrayList<>();
			fields.add(new TableFieldSchema().setName("device_id").setType("STRING"));
//			fields.add(new TableFieldSchema().setName("avg_speed").setType("FLOAT"));
//			fields.add(new TableFieldSchema().setName("slowdown_event").setType("BOOLEAN"));
//			fields.add(new TableFieldSchema().setName("window_timestamp").setType("TIMESTAMP"));
			TableSchema schema = new TableSchema().setFields(fields);
			return schema;
		}
	}

	public static void main(String[] args) {
		DeviceStatusStreamedUpdateOptions options = PipelineOptionsFactory.fromArgs(args).withValidation()
				.as(DeviceStatusStreamedUpdateOptions.class);
		Pipeline p = Pipeline.create(options);

		// Concepts #2 and #3: Our pipeline applies the composite CountWords
		// transform, and passes the
		// static FormatAsTextFn() to the ParDo transform.
		PCollection<PubsubMessage> pc1 = p.apply("ReadFromPubsub",
				PubsubIO.readMessagesWithAttributes().fromTopic(options.getPubsubTopic()));
		PCollection<DeviceMessage> pc2 = pc1.apply("BuildDeviceMessage", ParDo.of(new ParseAndDeserializePubsubMessageFn()));
		PCollection<TableRow> pc3 = pc2.apply("CreateBQRecord", ParDo.of(new CreateBigQueryRecordFn()));
//		pc.apply("WriteToDataStore", DatastoreIO.v1().write().withProjectId(options.getProject()));

		p.run().waitUntilFinish();
	}

}
