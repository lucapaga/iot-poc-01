import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { MatButtonToggleChange } from '@angular/material/button-toggle';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'IoT Device Manager';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  ngOnInit(): void {

  }

}
