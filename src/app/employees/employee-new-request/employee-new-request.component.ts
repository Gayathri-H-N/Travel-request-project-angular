import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeTravelService } from '../../services/employee-travel.service';
import { Router } from '@angular/router';

declare let bootstrap: any;
@Component({
  selector: 'app-employee-new-request',
  templateUrl: './employee-new-request.component.html',
  styleUrl: './employee-new-request.component.css'
})
export class EmployeeNewRequestComponent implements OnInit {
  newRequestForm!: FormGroup;
  userData: any = {};
  employeeName = '';
  employeeId = '';
  managerName='';
   
  constructor(
    private employeeService: EmployeeTravelService,
    private router: Router
  ) {}

  ngOnInit(): void {    
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData.role === 'Employee') {
        this.employeeName = userData.employee_name;
        this.employeeId = userData.employee_id.toString();
        this.managerName=userData.manager_name;
      }
    }
    this.newRequestForm = new FormGroup({
      employee_id: new FormControl({ value: this.employeeId, disabled: true }),
      employee_name: new FormControl({ value: this.employeeName, disabled: true }),
      manager_name: new FormControl({ value: this.managerName, disabled: true }),
      departure_location: new FormControl('', [Validators.required]),
      destination: new FormControl('', [Validators.required]),
      travel_mode: new FormControl('', [Validators.required]),
      departure_date: new FormControl('', [Validators.required]),
      return_date: new FormControl('', [Validators.required]),
      lodging_required: new FormControl('No'),                         
      preferred_lodge: new FormControl(''),                             
      purpose: new FormControl('', [Validators.required]),             
      employee_additional_notes: new FormControl(''),
    })

    this.newRequestForm.get('lodging_required')?.valueChanges.subscribe(value => {
      const preferredLodgeControl = this.newRequestForm.get('preferred_lodge');

      if (value) {
        preferredLodgeControl?.setValidators([Validators.required]); 
      } else {
        preferredLodgeControl?.clearValidators(); 
        preferredLodgeControl?.reset(); 
      }

      preferredLodgeControl?.updateValueAndValidity(); 
    });
  }

  submitRequest(): void {
    if (this.newRequestForm.valid) {
      this.employeeService.createRequest(this.newRequestForm.value).subscribe({
        next: (response) => {
          alert('Travel request submitted successfully!');
          this.router.navigate(['/employee/home']);
        },
        error: (error) => {
          alert('Error submitting request: ' + error.message);
          console.error(error);
        }
      });
    } else {
      alert('Please fill all required fields.');
    }
  }

   closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      let modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (!modalInstance) {
        modalInstance = new bootstrap.Modal(modalElement);
      }
      modalInstance.hide();
    }
  }

  discardRequest(): void {
    this.newRequestForm.reset();
    this.router.navigate(['/employee/home']);
  }
}



   



