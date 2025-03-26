import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminTravelService } from '../../services/admin-travel.service';

@Component({
  selector: 'app-admin-create',
  templateUrl: './admin-create.component.html',
  styleUrl: './admin-create.component.css'
})
export class AdminCreateComponent implements OnInit {
  createUserForm!: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminTravelService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createUserForm = this.fb.group({
      role: ['', Validators.required],  
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      manager: [''],  
      hire_date: ['', Validators.required],
      status: ['Active', Validators.required]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.createUserForm.invalid) {
      return;
    }
    this.adminService.createEmployeeManager(this.createUserForm.value).subscribe({
      next: (data) => {
        alert(`${this.createUserForm.value.role} added successfully.`);
        this.router.navigate(['/admin/travel-requests']);
      },
      error: (error) => {
        console.error('Error creating user', error);
        alert('Error creating user. Please check console for details.');
      }
    });
  }
}



