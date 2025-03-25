import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminTravelService } from '../../services/admin-travel.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css'
})
export class AdminHomeComponent implements OnInit {
  filterForm!: FormGroup;
  travelRequests: any[] = [];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminTravelService,
    private router: Router
  ) { }

  ngOnInit(): void { 
    this.filterForm = this.fb.group({
      sort_by: ['submission_date'],  
      status: [''],                  
      name: [''],                    
      departure_date: [''],          
      return_date: [''],           
      order: ['desc']                
    });

    this.filterForm.get('sort_by')?.valueChanges.subscribe(val => {
      if (val === 'submission_date') {
        this.filterForm.get('order')?.setValue('desc', { emitEvent: false });
      } else {
        this.filterForm.get('order')?.setValue('asc', { emitEvent: false });
      }
    });

    this.applyFilters();
  }

  
  applyFilters(): void {
    const filters = this.filterForm.value;
    console.log('Applying filters:', filters);

    this.adminService.getTravelRequests(filters).subscribe({
      next: (data) => {
        this.travelRequests = data;
        console.log('Travel requests:', this.travelRequests);
      },
      error: (error) => {
        console.error('Error fetching travel requests:', error);
      },
      complete: () => {
        console.log('Travel requests loaded successfully.');
      }
    });
  }

  // A helper function to format ISO date strings to local date strings
  formatDate(dateStr: string): string {
    if (!dateStr) { return ''; }
    const date = new Date(dateStr);
    return date.toLocaleDateString();
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

  viewRequest(requestId: number): void {
    this.router.navigate(['/admin-view-requests', requestId]);
  }
}
