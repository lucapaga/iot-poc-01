import { Component, OnInit } from '@angular/core';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { MatTableDataSource } from '@angular/material';

import { CreateDeviceFormComponent } from '../create-device-form/create-device-form.component';


@Component({
  selector: 'app-deviceslist',
  templateUrl: './deviceslist.component.html',
  styleUrls: ['./deviceslist.component.css']
})
export class DeviceslistComponent implements OnInit {
  displayedColumns = ['device_id', 'device_name', 'commands_topic', 'status_topic'];
  dataSource = null; //new MatTableDataSource<Element>(ELEMENT_DATA);

  deviceList = [];

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar,
              public dialog: MatDialog) { }

  ngOnInit() {
    this.loadDeviceList();
  }

  openCreateDevice(): void {
    let dialogRef = this.dialog.open(CreateDeviceFormComponent, {
          width: "600px",
          data: {}
        });
    dialogRef.afterClosed().subscribe(result => {
      if(result == null || result.device_id == null) {
        console.log("Oooook, you canceled")
      } else {
        console.log("Now saving: ", result);
        const api_path = '/api/v1/devices';
        console.log("API CALL: ", api_path);
        this.http.post(api_path, result).subscribe(data => {
          this.deviceList.push({
                device_id: "- ... PENDING ... -",
                device_name: result.deviceName
              });
          this.snackBar.open("New device succesfully created!", "", {duration: 2000});
        });
      }
    });
  }

  deleteDevice(deviceToDelete : DeviceElement) : void {
    console.log("Removing...: ", deviceToDelete);
    this.deviceList.splice(this.deviceList.indexOf(deviceToDelete), 1);
  }

  loadDeviceList(): void {
    const api_path = '/api/v1/devices';
    console.log("API CALL: ", api_path);
    this.http.get(api_path).subscribe(data => {
      console.log("This is the list of DEVICES: ", data);
      this.dataSource = new MatTableDataSource<DeviceElement>(data["status"]);
      this.deviceList = data["status"];
      this.snackBar.open("We found " + data["num_devices"] + " Devices", "", {duration: 1000});
    });
  }

}

export interface DeviceElement {
  device_id: string;
  device_name: string;
  commands_topic: string;
  status_topic: string;
}
