import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManagerTravelService } from '../../services/manager-travel.service';

@Component({
  selector: 'app-manager-view-requets',
  templateUrl: './manager-view-requets.component.html',
  styleUrl: './manager-view-requets.component.css'
})
export class ManagerViewRequetsComponent implements OnInit {
  requestId!: number;
  requestDetail: any;
  updateForm!: FormGroup;
  showMoreInfoField = false;
  managerName = '';  
  managerId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private managerService: ManagerTravelService
  ) {}

  ngOnInit(): void {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
    const userData = JSON.parse(userDataString);
    if (userData.role === 'Manager') {
      this.managerName = userData.manager_name;
      this.managerId = userData.manager_id.toString();
    }
  }
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRequestDetail();
    this.updateForm = this.fb.group({
      manager_note: ['',[Validators.required]]
    });
  }

  loadRequestDetail(): void {
    this.managerService.getTravelRequestDetail(this.requestId).subscribe({
      next: (data) => {
        this.requestDetail = data;
      },
      error: (err) => {
        console.error('Error fetching travel request details:', err);
        alert('Could not fetch travel request details.');
      }
    });
  }

  updateStatus(newStatus: string): void {
    if (newStatus === 'More Info Required' && !this.updateForm.value.manager_note.trim()) {
      alert('Please provide additional information.');
      return;
    }

    const payload: any = { status: newStatus };
    if (newStatus === 'More Info Required') {
      payload.manager_note = this.updateForm.value.manager_note;
    }

    this.managerService.updateTravelRequestStatus(this.requestId, payload).subscribe({
      next: (response) => {
        alert(`Travel request updated to ${newStatus}`);
        this.router.navigate(['/managers/manager-home']);
      },
      error: (err) => {
        console.error('Error updating travel request status:', err);
        alert('Could not update travel request status.');
      }
    });
  }

  MoreInfoClick(): void {
    this.showMoreInfoField = true;
  }
}


