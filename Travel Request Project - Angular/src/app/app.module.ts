import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EmployeesModule } from './employees/employees.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { ManagersModule } from './managers/managers.module';
import { AdminsModule } from './admins/admins.module';
import { SharedmoduleModule } from './sharedmodule/sharedmodule.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    EmployeesModule,
    ManagersModule,
    AdminsModule,
    FormsModule,
    HttpClientModule,
    SharedmoduleModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
