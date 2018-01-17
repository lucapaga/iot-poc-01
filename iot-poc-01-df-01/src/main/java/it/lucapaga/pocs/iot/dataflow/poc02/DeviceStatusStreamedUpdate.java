/**
 * 
 */
package it.lucapaga.pocs.iot.dataflow.poc02;

import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.extensions.gcp.options.GcpOptions;
import org.apache.beam.sdk.io.gcp.pubsub.PubsubIO;
import org.apache.beam.sdk.options.Default;
import org.apache.beam.sdk.options.DefaultValueFactory;
import org.apache.beam.sdk.options.Description;
import org.apache.beam.sdk.options.PipelineOptions;
import org.apache.beam.sdk.options.PipelineOptionsFactory;

/**
 * @author pagaclaire
 *
 */
public class DeviceStatusStreamedUpdate {

	public interface DeviceStatusStreamedUpdateOptions extends GcpOptions {
		@Description("Pub/Sub STATUS topic")
		@Default.InstanceFactory(PubsubTopicFactory.class)
		@Default.String("")
		String getPubsubTopic();

		void setPubsubTopic(String topic);

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

	public static void main(String[] args) {
		DeviceStatusStreamedUpdateOptions options = PipelineOptionsFactory.fromArgs(args).withValidation()
				.as(DeviceStatusStreamedUpdateOptions.class);
		Pipeline p = Pipeline.create(options);

		// Concepts #2 and #3: Our pipeline applies the composite CountWords
		// transform, and passes the
		// static FormatAsTextFn() to the ParDo transform.
		p.apply("ReadFromPubsub", PubsubIO.readMessages().fromTopic(options.getPubsubTopic()));

		p.run().waitUntilFinish();
	}

}
