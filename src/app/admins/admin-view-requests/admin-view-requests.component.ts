import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminTravelService } from '../../services/admin-travel.service';

@Component({
  selector: 'app-admin-view-requests',
  templateUrl: './admin-view-requests.component.html',
  styleUrl: './admin-view-requests.component.css'
})
export class AdminViewRequestsComponent implements OnInit {
  requestDetail: any; 
  updateForm!: FormGroup;
  requestId!: number;
  isClosed = false;
  moreInfoMode = false; 
  adminInfoRequested = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminTravelService: AdminTravelService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {  
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    // console.log(this.requestId);
    this.updateForm = this.fb.group({
      admin_note: ['']
    });
    this.loadRequest();
  }

  loadRequest(): void {
    this.adminTravelService.getTravelRequestById(this.requestId).subscribe({
      next: (data) => {
        this.requestDetail = data;
        console.log("API Response:", data);
        this.isClosed = this.requestDetail.admin_status && this.requestDetail.admin_status.toLowerCase() === 'closed';
        if (this.requestDetail.admin_status && this.requestDetail.admin_status.toLowerCase() === 'open' && this.requestDetail.admin_note) {
          this.adminInfoRequested = true;
        } else {
          this.adminInfoRequested = false;
        }
      },
      error: (error) => {
        console.error('Error fetching request details', error);
      }
    });
  }
  

  toggleMoreInfoMode(): void {
    this.moreInfoMode = !this.moreInfoMode;
  }

  updateStatus(status: string): void {
    if (status === 'More Info Required') {
      this.submitMoreInfo();
    }
  }

  submitMoreInfo(): void {
    const payload = {
      admin_note: this.updateForm.value.admin_note,
      admin_status: 'Open', 
      status: 'More Info Required' 
    };
    this.adminTravelService.requestMoreInfo(this.requestId, payload).subscribe({
      next: (data) => {
        console.log('Requested more info successfully', data);
        alert('Requested more info successfully');
        this.moreInfoMode = false; 
        this.adminInfoRequested = true;
        this.loadRequest(); 
      },
      error: (error) => {
        console.error('Error requesting more info', error);
      }
    });    
  }

  // Close the request (only if status is Approved) after confirmation
  closeRequest(): void {
    // Check both the overall status and the admin_status
    if (this.requestDetail.admin_status && this.requestDetail.admin_status.toLowerCase() === 'closed') {
      alert('This request is closed and cannot be updated.');
      return;
    }
    if (this.requestDetail.status.toLowerCase() !== 'approved') {
      alert('Only approved requests can be closed.');
      return;
    }
    if (confirm('Are you sure you want to close this request?')) {
      this.adminTravelService.closeRequest(this.requestId).subscribe({
        next: (data) => {
          console.log('Request closed successfully', data);
          alert('Request closed successfully');
          // Navigate to the admin home (listing) page after closing
          this.router.navigate(['/admin-home']);
        },
        error: (error) => {
          console.error('Error closing request', error);
        }
      });
    }
  }
  
}
  
  


