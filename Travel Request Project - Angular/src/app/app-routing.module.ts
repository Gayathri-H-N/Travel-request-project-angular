import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'employees', loadChildren: () => import('./employees/employees.module').then(m => m.EmployeesModule) },
  { path: 'login', component: LoginComponent },
  { path: 'managers', loadChildren: () => import('./managers/managers.module').then(m => m.ManagersModule) },
  { path: 'admins', loadChildren: () => import('./admins/admins.module').then(m => m.AdminsModule) },
  { path: 'sharedmodule', loadChildren: () => import('./sharedmodule/sharedmodule.module').then(m => m.SharedmoduleModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
