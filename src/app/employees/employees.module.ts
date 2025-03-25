import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeesComponent } from './employees.component';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';
import { EmployeeNewRequestComponent } from './employee-new-request/employee-new-request.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { SharedmoduleModule } from '../sharedmodule/sharedmodule.module';

@NgModule({
  declarations: [
    EmployeesComponent,
    EmployeeHomeComponent,
    EmployeeNewRequestComponent,
    EmployeeDetailComponent,
  ],
  imports: [
    CommonModule,
    EmployeesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedmoduleModule
  ]
})
export class EmployeesModule { }
