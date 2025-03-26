import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ManagerTravelService } from '../../services/manager-travel.service';

@Component({
  selector: 'app-manager-home',
  templateUrl: './manager-home.component.html',
  styleUrl: './manager-home.component.css'
})
export class ManagerHomeComponent implements OnInit {
  filterForm!: FormGroup;
  travelRequests: any[] = [];
  managerName = '';  
  managerId = '';    


  constructor(
    private fb: FormBuilder,
    private managerService: ManagerTravelService
  ) { }

  ngOnInit(): void {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
    const userData = JSON.parse(userDataString);
    if (userData.role === 'Manager') {
      this.managerName = userData.manager_name;
      this.managerId = userData.manager_id.toString();
    }
  }
    this.filterForm = this.fb.group({
      sort_by: ['submission_date'],  
      status: [''],                  
      name: [''],                    
      departure_date: [''],              
      return_date: [''],                
      order: ['desc']                
    });

    this.applyFilters();
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    console.log(filters)

    this.managerService.getTravelRequests(filters).subscribe({
      next: (data) => {
        this.travelRequests = data;
        console.log(this.travelRequests)
      },
      error: (error) => {
        console.error('Error fetching travel requests:', error);
      },
      complete: () => {
        console.log('Travel requests loaded successfully.');
      }
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      sort_by: 'submission_date',
      status: '',
      name: '',
      departure_date: '',
      return_date: '',
      order: 'desc'
    });
    this.applyFilters();
  }
}
