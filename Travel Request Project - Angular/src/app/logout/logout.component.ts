import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent {
  constructor(private authService: AuthService, private router: Router) {}

  performLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        alert('Logged out successfully!');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        alert('Error logging out: ' + error.message);
        console.error(error);
      }
    });
  }

}
