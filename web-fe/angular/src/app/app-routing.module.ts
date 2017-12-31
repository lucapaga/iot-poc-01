import { NgModule } from '@angular/core';

//import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }          from './home/home.component';
import { DeviceslistComponent }   from './deviceslist/deviceslist.component';
import { DevicedetailComponent } from './devicedetail/devicedetail.component';

const routesConfiguration: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'deviceslist', component: DeviceslistComponent },
  { path: 'devicedetail/:device_id', component: DevicedetailComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

/*
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
*/
@NgModule({
  imports: [ RouterModule.forRoot(routesConfiguration) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
