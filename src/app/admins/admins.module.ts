import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminsRoutingModule } from './admins-routing.module';
import { AdminsComponent } from './admins.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminViewRequestsComponent } from './admin-view-requests/admin-view-requests.component';
import { AdminCreateComponent } from './admin-create/admin-create.component';
import { SharedmoduleModule } from '../sharedmodule/sharedmodule.module';


@NgModule({
  declarations: [
    AdminsComponent,
    AdminHomeComponent,
    AdminViewRequestsComponent,
    AdminCreateComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminsRoutingModule,
    SharedmoduleModule
  ]
})
export class AdminsModule { }
