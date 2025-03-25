import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './employees.component';
import { EmployeeHomeComponent } from './employee-home/employee-home.component';
import { EmployeeNewRequestComponent } from './employee-new-request/employee-new-request.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';


const routes: Routes = [
  { path: '', component: EmployeesComponent },
  { path: 'home', component: EmployeeHomeComponent },
  { path: 'new-request', component: EmployeeNewRequestComponent },
  { path: 'employee-detail/:id', component: EmployeeDetailComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }
