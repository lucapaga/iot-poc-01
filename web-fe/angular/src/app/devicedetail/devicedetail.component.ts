import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { MatButtonToggleChange } from '@angular/material/button-toggle';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-devicedetail',
  templateUrl: './devicedetail.component.html',
  styleUrls: ['./devicedetail.component.css']
})
export class DevicedetailComponent implements OnInit {
  deviceOutputs = null;

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar,
              private route: ActivatedRoute,
              private location: Location) {

              }

  ngOnInit(): void {
    this.loadDeviceOutputs();
  }

  loadDeviceOutputs(): void {
    const device_id = this.route.snapshot.paramMap.get('device_id');
    const api_path = '/api/v1/devices/' + device_id + '/outs';
    console.log("Detailing device: ", device_id);
    console.log("Call API: ", api_path);
    this.http.get(api_path).subscribe(data => {
      console.log("This is the list of outputs: ", data);
      this.deviceOutputs = data["status"];
      this.snackBar.open("We found " + data["num_lights"] + " commandable outputs");
    });
  }

    switchAllOff() {
  //    this.http.get('https://pi-web-pubsub-py-be-dot-luca-paganelli-formazione.appspot.com/piall/off').subscribe(data => {
      this.http.get('/piall/off').subscribe(data => {
        console.log("All LEDs are now OFF: ", data);
        this.snackBar.open("All LEDs are now OFF");
      });
    }

    toggleLEDs() {
      this.http.get('/pitoggle/all').subscribe(data => {
        console.log("All LEDs are now INVERTED: ", data);
        this.snackBar.open("All LEDs are now INVERTED");
      });
    }

    switchAllOn() {
      this.http.get('/piall/on').subscribe(data => {
        console.log("All LEDs are now ON: ", data);
        this.snackBar.open("All LEDs are now ON");
      });
    }

    toggleRedLED(theEvent : MatButtonToggleChange) {
      console.log("Spiking command:", theEvent);

      if(theEvent.source.checked) {
        this.http.get('/pi/red/on').subscribe(data => {
          // Read the result field from the JSON response.
          //this.results = data['results'];
          console.log("That's it: ", data);
          this.snackBar.open("RED LED has been switched ON", "UNDO", { duration: 2000 });/*.onAction(() => {
            console.log("UNDOING RED ON")
          });*/
        });
      } else {
        this.http.get('/pi/red/off').subscribe(data => {
          // Read the result field from the JSON response.
          //this.results = data['results'];
          console.log("That's it: ", data);
        });
      }

    }

    toggleGreenLED(theEvent : MatButtonToggleChange) {
      console.log("Spiking command:", theEvent);

      if(theEvent.source.checked) {
        this.http.get('/pi/green/on').subscribe(data => {
          // Read the result field from the JSON response.
          //this.results = data['results'];
          console.log("That's it: ", data);
        });
      } else {
        this.http.get('/pi/green/off').subscribe(data => {
          // Read the result field from the JSON response.
          //this.results = data['results'];
          console.log("That's it: ", data);
        });
      }

    }


    toggleLightBulb(theEvent : MatButtonToggleChange) {
      console.log("Spiking command:", theEvent);

      if(theEvent.source.checked) {
        this.http.get('/pi/light-bulb/on').subscribe(data => {
          // Read the result field from the JSON response.
          //this.results = data['results'];
          console.log("That's it: ", data);
        });
      } else {
        this.http.get('/pi/light-bulb/off').subscribe(data => {
          // Read the result field from the JSON response.
          //this.results = data['results'];
          console.log("That's it: ", data);
        });
      }

    }
}
