package it.lucapaga.pocs.iot.dataflow.poc03.flow;

import org.apache.beam.sdk.extensions.gcp.options.GcpOptions;
import org.apache.beam.sdk.options.Default;
import org.apache.beam.sdk.options.Description;

public interface DeviceUpdatesStreamingPipelineOptions extends GcpOptions {
	@Description("Pub/Sub STATUS topic")
	String getSourceTopicName();

	void setSourceTopicName(String topicName);

	@Description("Pub/Sub STATUS subscription")
	String getSourceSubscriptionName();

	void setSourceSubscriptionName(String subscriptionName);

	@Description("BQ DATASET NAME")
	@Default.String("IOT_POC_01")
	String getBigQueryDatasetName();

	void setBigQueryDatasetName(String s);

	@Description("BQ TABLE FOR SENSOR DATA")
	@Default.String("PI_VALUES")
	String getSensorDataBQTableName();

	void setSensorDataBQTableName(String s);

	@Description("BQ TABLE FOR STATUS UPDATES")
	@Default.String("PI_STATUSES")
	String getStatusUpdatesBQTableName();

	void setStatusUpdatesBQTableName(String s);
}
