import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminsComponent } from './admins.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AdminViewRequestsComponent } from './admin-view-requests/admin-view-requests.component';
import { AdminCreateComponent } from './admin-create/admin-create.component';

const routes: Routes = [
  { path: '', component: AdminsComponent },
  { path: 'admin-home', component:AdminHomeComponent},
  { path: 'admin-view-requests/:id', component:AdminViewRequestsComponent},
  { path: 'admin-create', component:AdminCreateComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminsRoutingModule { }
