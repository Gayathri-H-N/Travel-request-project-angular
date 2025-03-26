import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeTravelService } from '../../services/employee-travel.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.css'
})
export class EmployeeDetailComponent  implements OnInit {
  requestDetail: any;
  requestId!: number;
  employeeName = '';
  employeeId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeTravelService: EmployeeTravelService
  ) {}

  ngOnInit(): void {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData.role === 'Employee') {
        this.employeeName = userData.employee_name;
        this.employeeId = userData.employee_id.toString();
      }
    }
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    console.log("Request ID:", this.requestId);
    this.loadRequestDetail();
  }

  loadRequestDetail(): void {
    this.employeeTravelService.getTravelRequestById(this.requestId).subscribe({
      next: (data) => {
        this.requestDetail = data;
        console.log("API Response:", data);
      },
      error: (error) => {
        console.error('Error fetching travel request details', error);
      }
    });
  }
}