import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { HttpClient } from '@angular/common/http';

import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material';

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

  makeBool(aString: string): boolean {
    if(aString != null && aString.toLowerCase() == "true") {
      return true;
    }
    return false;
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

  onSlideChange(theEvent : MatSlideToggleChange) {
    if(theEvent != null) {
      console.log("EVENT: ", theEvent);
      var targetStatus = theEvent.checked;
      var targetPIN = theEvent.source.id;
      console.log("Operating on PIN " + targetPIN + " to SWITCH IT " + targetStatus);

      const device_id = this.route.snapshot.paramMap.get('device_id');
      const api_path = '/api/v1/devices/' + device_id + '/outs/p/' + targetPIN;
      console.log("API CALL: ", api_path);

      var api_body = { led_state : "off" };
      if(targetStatus) {
        api_body = { led_state : "on" };
      }
      console.log("API POST DATA: ", api_body);

      this.http.post(api_path, api_body).subscribe(data => {
        console.log("API RETURN: ", data);
        if(data["status"] != null && data["status"] == "COMMAND SUBMITTED") {
          if(targetStatus) {
            this.snackBar.open("Here you have it, your LED/LIGHT is now ON!");
          } else {
            this.snackBar.open("Here you have it, your LED/LIGHT is now OFF!");
          }
        } else {
          this.snackBar.open("Something went wrong...");
        }
      });
    }
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
