import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//import { ClarityModule } from "clarity-angular";

import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule, MatCheckboxModule, MatToolbarModule, MatSnackBarModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DeviceslistComponent } from './deviceslist/deviceslist.component';
import { HomeComponent } from './home/home.component';
import { DevicedetailComponent } from './devicedetail/devicedetail.component';
import { CreateDeviceFormComponent } from './create-device-form/create-device-form.component';


@NgModule({
  declarations: [
    AppComponent,
    DeviceslistComponent,
    HomeComponent,
    DevicedetailComponent,
    CreateDeviceFormComponent
  ],
  imports: [
    BrowserAnimationsModule, FormsModule,
    BrowserModule, HttpClientModule,
    MatButtonModule, MatCheckboxModule,
    MatButtonToggleModule, MatIconModule,
    MatSidenavModule, MatToolbarModule, MatSnackBarModule, AppRoutingModule,
    MatTableModule, MatMenuModule, MatCardModule, MatSlideToggleModule,
    MatDialogModule, MatFormFieldModule, MatInputModule
  ],
  exports: [
    MatButtonModule, MatCheckboxModule,
    MatButtonToggleModule, MatIconModule,
    MatSidenavModule, MatToolbarModule, MatSnackBarModule,
    MatTableModule, MatMenuModule, MatCardModule, MatSlideToggleModule,
    MatDialogModule, MatFormFieldModule, MatInputModule
  ],
  entryComponents: [
    CreateDeviceFormComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
