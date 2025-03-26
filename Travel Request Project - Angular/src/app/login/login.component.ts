import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
 
  adminUsername = '';
  adminPassword = '';

  employeeUsername = '';
  employeePassword = '';

  managerUsername = '';
  managerPassword = '';

  constructor(
    private authService: AuthService,
    // private employeeService: EmployeeTravelService, 
    private router: Router) {}
 

  // Login as Admin
  loginAsAdmin(): void {
    const credentials = { username: this.adminUsername, password: this.adminPassword };
    this.authService.login(credentials).subscribe({
      next: (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if (data.role === 'Admin') {
          this.authService.getUserDetails().subscribe({
            next: (userData) => {
              localStorage.setItem('userData', JSON.stringify(userData));
              this.router.navigate(['/admins/admin-home']);
            },
            error: (err) => {
              console.error('Error fetching admin details:', err);
              alert('Could not fetch admin details');
            }
          }); 
        } else {
          alert('Logged in user is not Admin');
        }
      },
      error: (err) => {
        console.error('Admin login error:', err);
        alert('Invalid admin credentials');
      }
    });
  }

  // Login as Employee
  loginAsEmployee(): void {
    const credentials = { username: this.employeeUsername, password: this.employeePassword };
    this.authService.login(credentials).subscribe({
      next: (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if (data.role === 'Employee') {
          this.authService.getUserDetails().subscribe({
            next: (userData) => {
              localStorage.setItem('userData', JSON.stringify(userData));
              this.router.navigate(['/employees/home']);
            },
            error: (err) => {
              console.error('Error fetching employee details:', err);
              alert('Could not fetch employee details');
            }
          });
        } else {
          alert('Logged in user is not Employee');
        }
      },
      error: (err) => {
        console.error('Employee login error:', err);
        alert('Invalid employee credentials');
      }
    });
  }


  // Login as Manager
  loginAsManager(): void {
    const credentials = { username: this.managerUsername, password: this.managerPassword };
    this.authService.login(credentials).subscribe({
      next: (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        if (data.role === 'Manager') {
          this.authService.getUserDetails().subscribe({
            next: (userData) => {
              localStorage.setItem('userData', JSON.stringify(userData));
              this.router.navigate(['/managers/manager-home']);
            },
            error: (err) => {
              console.error('Error fetching manager details:', err);
              alert('Could not fetch manager details');
            }
          });
        } else {
          alert('Logged in user is not Manager');
        }
      },
      error: (err) => {
        console.error('Manager login error:', err);
        alert('Invalid manager credentials');
      }
    });
  }
}



