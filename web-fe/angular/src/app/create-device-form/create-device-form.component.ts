import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatFormField } from '@angular/material';

@Component({
  selector: 'app-create-device-form',
  templateUrl: './create-device-form.component.html',
  styleUrls: ['./create-device-form.component.css']
})
export class CreateDeviceFormComponent implements OnInit {
  name = null;
  commandsTopic = null;
  statusTopic = null

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CreateDeviceFormComponent>) { }

  ngOnInit() : void {
  }

  confirmNewDevice() : void {
    let daObject = {
                      device_id: "",
                      deviceName: this.name,
                      commandsTopic: this.commandsTopic,
                      statusTopic: this.statusTopic
                    };
    console.log("OK, confirmed. ", daObject)
    this.dialogRef.close(daObject);
  }

  cancelSumbission() : void {
    this.dialogRef.close({});
  }
}
