package it.lucapaga.pocs.iot.dataflow.poc03.model;

import java.io.Serializable;

public class DeviceIODetails implements Serializable {
	private static final long serialVersionUID = 1L;
	
	public static final String UNIT_TYPES_SENSOR = "sensor";
	
	private String unit = null;
	private String unit_type = null;
	private Double value = null;
	private String status = null;
	private Integer gpio_pin = null;

	public DeviceIODetails(String unit, String unit_type, Double value, String status, Integer gpio_pin) {
		super();
		this.unit = unit;
		this.unit_type = unit_type;
		this.value = value;
		this.status = status;
		this.gpio_pin = gpio_pin;
	}

	public String getUnit() {
		return unit;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public String getUnit_type() {
		return unit_type;
	}

	public void setUnit_type(String unit_type) {
		this.unit_type = unit_type;
	}

	public Double getValue() {
		return value;
	}

	public void setValue(Double value) {
		this.value = value;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Integer getGpio_pin() {
		return gpio_pin;
	}

	public void setGpio_pin(Integer gpio_pin) {
		this.gpio_pin = gpio_pin;
	}
}
