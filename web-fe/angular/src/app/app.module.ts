import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//import { ClarityModule } from "clarity-angular";

import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule, MatCheckboxModule, MatToolbarModule, MatSnackBarModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DeviceslistComponent } from './deviceslist/deviceslist.component';
import { HomeComponent } from './home/home.component';
import { DevicedetailComponent } from './devicedetail/devicedetail.component';


@NgModule({
  declarations: [
    AppComponent,
    DeviceslistComponent,
    HomeComponent,
    DevicedetailComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule, HttpClientModule,
    MatButtonModule, MatCheckboxModule,
    MatButtonToggleModule, MatIconModule,
    MatSidenavModule, MatToolbarModule, MatSnackBarModule, AppRoutingModule,
    MatTableModule, MatMenuModule, MatCardModule, MatSlideToggleModule
  ],
  exports: [
    MatButtonModule, MatCheckboxModule,
    MatButtonToggleModule, MatIconModule,
    MatSidenavModule, MatToolbarModule, MatSnackBarModule,
    MatTableModule, MatMenuModule, MatCardModule, MatSlideToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
