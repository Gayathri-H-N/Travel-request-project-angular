import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagersComponent } from './managers.component';
import { ManagerHomeComponent } from './manager-home/manager-home.component';
import { ManagerViewRequetsComponent } from './manager-view-requets/manager-view-requets.component';

const routes: Routes = [
  { path: '', component: ManagersComponent },
  { path:'manager-home',component:ManagerHomeComponent},
  {path:'manager-view-requests/:id',component:ManagerViewRequetsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagersRoutingModule { }
