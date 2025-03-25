import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedmoduleRoutingModule } from './sharedmodule-routing.module';
import { SharedmoduleComponent } from './sharedmodule.component';
import { LogoutComponent } from '../logout/logout.component';


@NgModule({
  declarations: [
    SharedmoduleComponent,
    LogoutComponent
  ],
  imports: [
    CommonModule,
    SharedmoduleRoutingModule
  ],
  exports: [
    LogoutComponent 
  ]
})
export class SharedmoduleModule { }
