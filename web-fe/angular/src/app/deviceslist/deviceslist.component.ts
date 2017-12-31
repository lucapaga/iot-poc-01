import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import {MatSnackBar} from '@angular/material';
import {MatTableDataSource} from '@angular/material';



@Component({
  selector: 'app-deviceslist',
  templateUrl: './deviceslist.component.html',
  styleUrls: ['./deviceslist.component.css']
})
export class DeviceslistComponent implements OnInit {
  displayedColumns = ['device_id', 'device_name', 'commands_topic', 'status_topic'];
  dataSource = null; //new MatTableDataSource<Element>(ELEMENT_DATA);

  //deviceList = [];

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadDeviceList();
  }


  loadDeviceList(): void {
    const api_path = '/api/v1/devices';
    console.log("API CALL: ", api_path);
    this.http.get(api_path).subscribe(data => {
      console.log("This is the list of DEVICES: ", data);
      this.dataSource = new MatTableDataSource<DeviceElement>(data["status"]);
      this.snackBar.open("We found " + data["num_devices"] + " Devices");
    });
  }

}

export interface DeviceElement {
  device_id: string;
  device_name: string;
  commands_topic: string;
  status_topic: string;
}
