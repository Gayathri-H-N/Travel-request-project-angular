import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedmoduleComponent } from './sharedmodule.component';

const routes: Routes = [{ path: '', component: SharedmoduleComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedmoduleRoutingModule { }
