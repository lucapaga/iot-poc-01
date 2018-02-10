package it.lucapaga.pocs.iot.dataflow.poc03.flow;

import org.apache.beam.sdk.Pipeline;
import org.apache.beam.sdk.io.gcp.bigquery.BigQueryIO;
import org.apache.beam.sdk.io.gcp.datastore.DatastoreIO;
import org.apache.beam.sdk.io.gcp.pubsub.PubsubIO;
import org.apache.beam.sdk.io.gcp.pubsub.PubsubMessage;
import org.apache.beam.sdk.options.PipelineOptionsFactory;
import org.apache.beam.sdk.transforms.ParDo;
import org.apache.beam.sdk.values.PCollection;

import com.google.api.services.bigquery.model.TableRow;
import com.google.datastore.v1.Entity;

import it.lucapaga.pocs.iot.dataflow.poc03.model.DeviceDetails;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.CreateSensorValuesBigQueryRecordFn;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.CreateStatusUpdatesBigQueryRecordFn;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.DataStoreRetrievalLogger;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.FilterSensorValuesFn;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.FilterStatusValuesFn;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.FlattenDeviceMessageFn;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.ParseDeviceMessageFn;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.PrepareBigQueryRowsForSensorValuesFn;
import it.lucapaga.pocs.iot.dataflow.poc03.transforms.PrepareBigQueryRowsForStatusValuesFn;

public class DeviceUpdatesStreamingPipeline {
	public static void main(String[] args) {
		DeviceUpdatesStreamingPipelineOptions options = PipelineOptionsFactory.fromArgs(args).withValidation()
				.as(DeviceUpdatesStreamingPipelineOptions.class);
		Pipeline p = Pipeline.create(options);

		PCollection<PubsubMessage> pubsubSource = configurePubSubSourceSink(p, options);
		PCollection<Entity> dataStoreSource = configureDataStoreSourceSink(p, options);
		PCollection<Entity> dataStoreSource2 = logRetrievedEntities(dataStoreSource, options);
		PCollection<DeviceDetails> deviceDetails = configureMsgParser(pubsubSource, options);
		// PCollection<Entity> dataStoreIORecord =
		// retrieveDeviceFromDataStoreAndPrepareUpdate(deviceDetails, options);
		PCollection<DeviceDetails> deviceDetailsFlat = flattenDeviceDetails(deviceDetails, options);
		PCollection<DeviceDetails> sensorValuesOnly = filterSensorValueIODetails(deviceDetailsFlat, options);
		PCollection<DeviceDetails> statusValuesOnly = filterStatusValueIODetails(deviceDetailsFlat, options);
		PCollection<TableRow> bqValueRecords = prepareBigQueryRowsForSensorValues(sensorValuesOnly, options);
		PCollection<TableRow> bqStatusRecords = prepareBigQueryRowsForStatusValues(statusValuesOnly, options);
		writeSensorValuesToBQ(bqValueRecords, options);
		writeStatusValuesToBQ(bqStatusRecords, options);
		writeDeviceUpdatesToDataStore(dataStoreSource2, options);

		p.run().waitUntilFinish();
	}

	private static PCollection<Entity> logRetrievedEntities(PCollection<Entity> dataStoreSource,
			DeviceUpdatesStreamingPipelineOptions options) {
		return dataStoreSource.apply("LogDataStoreRetrieval", ParDo.of(new DataStoreRetrievalLogger()));
	}

	private static PCollection<Entity> configureDataStoreSourceSink(Pipeline p,
			DeviceUpdatesStreamingPipelineOptions options) {
		// Query<Entity> query = Query.newBuilder().
		// newEntityQueryBuilder().setKind("IOTDevice")
		// .setFilter(StructuredQuery.PropertyFilter.eq("device_id",
		// dd.getDevice_id()))
		// .setOrderBy(OrderBy.asc("created")).build();
		PCollection<Entity> entities = p
				.apply(DatastoreIO.v1().read().withProjectId(options.getProject()).withLiteralGqlQuery("SELECT * FROM IOTDevice"));
		return entities;
	}

	private static void writeDeviceUpdatesToDataStore(PCollection<Entity> dataStoreIORecord,
			DeviceUpdatesStreamingPipelineOptions options) {

	}

	private static PCollection<Entity> retrieveDeviceFromDataStoreAndPrepareUpdate(
			PCollection<DeviceDetails> deviceDetails, DeviceUpdatesStreamingPipelineOptions options) {
		return null;
		// return
		// deviceDetails.apply("retrieveDeviceFromDataStoreAndPrepareUpdate",
		// ParDo.of(new RetrieveDeviceFromDataStoreAndPrepareUpdateFn()));
	}

	private static void writeStatusValuesToBQ(PCollection<TableRow> bqStatusRecords,
			DeviceUpdatesStreamingPipelineOptions options) {
		bqStatusRecords.apply("Statuses_BigQueryRecordSaver",
				BigQueryIO.writeTableRows()
						.to(options.getProject() + ":" + options.getBigQueryDatasetName() + "."
								+ options.getStatusUpdatesBQTableName())
						.withSchema(CreateStatusUpdatesBigQueryRecordFn.getSchema())
						.withWriteDisposition(BigQueryIO.Write.WriteDisposition.WRITE_APPEND)
						.withCreateDisposition(BigQueryIO.Write.CreateDisposition.CREATE_IF_NEEDED));
	}

	private static void writeSensorValuesToBQ(PCollection<TableRow> bqValueRecords,
			DeviceUpdatesStreamingPipelineOptions options) {
		bqValueRecords.apply("Values_BigQueryRecordSaver", BigQueryIO.writeTableRows()
				.to(options.getProject() + ":" + options.getBigQueryDatasetName() + "."
						+ options.getSensorDataBQTableName())
				.withSchema(CreateSensorValuesBigQueryRecordFn.getSchema())
				.withWriteDisposition(BigQueryIO.Write.WriteDisposition.WRITE_APPEND)
				.withCreateDisposition(BigQueryIO.Write.CreateDisposition.CREATE_IF_NEEDED));
	}

	private static PCollection<TableRow> prepareBigQueryRowsForStatusValues(PCollection<DeviceDetails> statusValuesOnly,
			DeviceUpdatesStreamingPipelineOptions options) {
		return statusValuesOnly.apply("prepareBigQueryRowsForStatusValues",
				ParDo.of(new PrepareBigQueryRowsForStatusValuesFn()));
	}

	private static PCollection<TableRow> prepareBigQueryRowsForSensorValues(PCollection<DeviceDetails> sensorValuesOnly,
			DeviceUpdatesStreamingPipelineOptions options) {
		return sensorValuesOnly.apply("prepareBigQueryRowsForSensorValues",
				ParDo.of(new PrepareBigQueryRowsForSensorValuesFn()));
	}

	private static PCollection<DeviceDetails> filterStatusValueIODetails(PCollection<DeviceDetails> deviceDetailsFlat,
			DeviceUpdatesStreamingPipelineOptions options) {
		return deviceDetailsFlat.apply("DeviceMessageFilter_StatusValues", ParDo.of(new FilterStatusValuesFn()));
	}

	private static PCollection<DeviceDetails> filterSensorValueIODetails(PCollection<DeviceDetails> deviceDetailsFlat,
			DeviceUpdatesStreamingPipelineOptions options) {
		return deviceDetailsFlat.apply("DeviceMessageFilter_SensorValues", ParDo.of(new FilterSensorValuesFn()));
	}

	private static PCollection<DeviceDetails> flattenDeviceDetails(PCollection<DeviceDetails> deviceDetails,
			DeviceUpdatesStreamingPipelineOptions options) {
		return deviceDetails.apply("DeviceMessageFlattener", ParDo.of(new FlattenDeviceMessageFn()));
	}

	private static PCollection<DeviceDetails> configureMsgParser(PCollection<PubsubMessage> pubsubSource,
			DeviceUpdatesStreamingPipelineOptions options) {
		return pubsubSource.apply("DeviceMessageParser", ParDo.of(new ParseDeviceMessageFn()));
	}

	private static PCollection<PubsubMessage> configurePubSubSourceSink(Pipeline p,
			DeviceUpdatesStreamingPipelineOptions options) {
		PCollection<PubsubMessage> pubsubSource = null;
		if (options.getSourceSubscriptionName() != null && !"".equals(options.getSourceSubscriptionName())) {
			pubsubSource = p.apply("PubsubIngestorOnExistingSubscription",
					PubsubIO.readMessagesWithAttributes().fromSubscription(options.getSourceSubscriptionName()));
		} else {
			pubsubSource = p.apply("PubsubIngestorOnTopic",
					PubsubIO.readMessagesWithAttributes().fromTopic(options.getSourceTopicName()));
		}
		return pubsubSource;
	}
}
