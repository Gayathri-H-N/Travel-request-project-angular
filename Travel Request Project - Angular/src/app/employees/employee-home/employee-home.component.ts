import { Component, OnInit } from '@angular/core';
import { EmployeeTravelService } from '../../services/employee-travel.service';
declare let bootstrap: any;

@Component({
  selector: 'app-employee-home',
  templateUrl: './employee-home.component.html',
  styleUrl: './employee-home.component.css'
})
export class EmployeeHomeComponent implements OnInit {
  request_data: any = [];  
  employeeName = '';  
  employeeId = '';  
  selectedRequestId: number | null = null;
  selectedRequest: any = null;  
  additionalInfo = '';
  adminResponse = '';
  managerRequest = '';
  isModalOpen = false; 

  constructor(private employeeService: EmployeeTravelService) {}

  ngOnInit(): void {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData.role === 'Employee') {
        this.employeeName = userData.employee_name;
        this.employeeId = userData.employee_id.toString();
      }
    }
    this.loadRequests();
  }

  loadRequests(): void {
    this.employeeService.getData().subscribe({
      next: (data) => {
        console.log('Updated travel requests:', data);
        this.request_data = data;  
      },
      error: (error) => {
        console.error('Error fetching updated requests:', error);
      }
    });
  }

  isAdminClosed(request: any): boolean {
    return request.admin_status === 'Closed';
  }

  deleteRequest(requestId: number): void {
    this.employeeService.deleteTravelRequest(requestId).subscribe({
      next: () => {
        alert('Travel request canceled successfully.');
        this.loadRequests();
      },
      error: (error) => {
        console.error('Error canceling travel request', error);
      }
    });
  }

  openModal(requestId: number): void {
    this.employeeService.getTravelRequestById(requestId).subscribe({
      next: (fullRequest) => {
        this.selectedRequest = fullRequest;
        this.selectedRequestId = requestId; 
        console.log('Selected Request ID:', this.selectedRequestId);
        console.log('Selected Full Request:', this.selectedRequest);
        this.additionalInfo = '';
        this.adminResponse = '';
        const modalElement = document.getElementById('provideInfoModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      },
      error: (err) => {
        console.error('Error fetching full request details:', err);
      }
    });
  }
  
  submitAdditionalInfo(): void {
    console.log('submitAdditionalInfo called');
    
    if (!this.additionalInfo.trim() && !this.adminResponse.trim()) {
      alert('Please enter additional information.');
      return;
    }
  
    if (this.additionalInfo.trim()) {
      this.employeeService.provideInfoToManager(this.selectedRequestId!, { 
        employee_response_to_manager: this.additionalInfo 
      }).subscribe({
        next: () => {
          alert('Manager additional info provided successfully.');
          this.loadRequests();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error providing manager info', error);
        }
      });
    }
    
    if (this.adminResponse.trim()) {
      this.employeeService.provideAdminInfo(this.selectedRequestId!, { 
        employee_response_to_admin: this.adminResponse 
      }).subscribe({
        next: () => {
          alert('Admin additional info provided successfully.');
          this.loadRequests();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error providing admin info', error);
        }
      });
    }
  }
  
  // Ensure modal and backdrop are removed
  closeModal(): void {
    const modalElement = document.getElementById('provideInfoModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    document.body.classList.remove('modal-open'); // Remove Bootstrap modal class
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
  }
  
  
}