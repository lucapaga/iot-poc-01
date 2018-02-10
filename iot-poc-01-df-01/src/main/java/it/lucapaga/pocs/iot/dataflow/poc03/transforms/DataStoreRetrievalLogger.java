package it.lucapaga.pocs.iot.dataflow.poc03.transforms;

import org.apache.beam.sdk.transforms.DoFn;

import com.google.datastore.v1.Entity;

public class DataStoreRetrievalLogger extends DoFn<Entity, Entity> {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@ProcessElement
	public void processElement(ProcessContext c) {
		Entity dd = c.element();
		System.out.println("[DataStoreRetrievalLogger] STICAZZI = " + dd);
		// Datastore datastore =
		// DatastoreOptions.getDefaultInstance().getService();
		// Query<Entity> query =
		// Query.newEntityQueryBuilder().setKind("IOTDevice")
		// .setFilter(StructuredQuery.PropertyFilter.eq("device_id",
		// dd.getDevice_id()))
		// .setOrderBy(OrderBy.asc("created")).build();
		// Iterator<Entity> iE = datastore.run(query);
		// if (iE != null) {
		// while (iE.hasNext()) {
		// System.out.println("[RetrieveDeviceFromDataStoreAndPrepareUpdateFn]
		// DataStore Entity Found!");
		// Entity entity = (Entity) iE.next();
		// String deviceName = entity.getString("device_name");
		// System.out.println("[RetrieveDeviceFromDataStoreAndPrepareUpdateFn]
		// Device Name = " + deviceName);
		// c.output(entity);
		// }
		// }
	}
}
