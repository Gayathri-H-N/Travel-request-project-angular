import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagersRoutingModule } from './managers-routing.module';
import { ManagersComponent } from './managers.component';
import { ManagerHomeComponent } from './manager-home/manager-home.component';
import { ManagerViewRequetsComponent } from './manager-view-requets/manager-view-requets.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../sharedmodule/sharedmodule.module';


@NgModule({
  declarations: [
    ManagersComponent,
    ManagerHomeComponent,
    ManagerViewRequetsComponent,
  ],
  imports: [
    CommonModule,
    ManagersRoutingModule,
    ReactiveFormsModule,
    SharedmoduleModule
  ]
})
export class ManagersModule { }
