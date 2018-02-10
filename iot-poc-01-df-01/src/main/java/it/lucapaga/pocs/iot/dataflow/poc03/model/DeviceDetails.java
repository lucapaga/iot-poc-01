package it.lucapaga.pocs.iot.dataflow.poc03.model;

import java.io.Serializable;
import java.util.List;

public class DeviceDetails implements Serializable {
	private static final long serialVersionUID = 1L;

	private String device_id = null;
	private List<DeviceIODetails> units = null;
	private Long ts = null;

	public DeviceDetails(String device_id, List<DeviceIODetails> units, Long ts) {
		super();
		this.device_id = device_id;
		this.units = units;
		this.ts = ts;
	}

	public String getDevice_id() {
		return device_id;
	}

	public void setDevice_id(String device_id) {
		this.device_id = device_id;
	}

	public List<DeviceIODetails> getUnits() {
		return units;
	}

	public void setUnits(List<DeviceIODetails> units) {
		this.units = units;
	}

	public Long getTs() {
		return ts;
	}

	public void setTs(Long ts) {
		this.ts = ts;
	}
}
