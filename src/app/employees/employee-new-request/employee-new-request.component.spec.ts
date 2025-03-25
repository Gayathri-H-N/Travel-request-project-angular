import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeNewRequestComponent } from './employee-new-request.component';

describe('EmployeeNewRequestComponent', () => {
  let component: EmployeeNewRequestComponent;
  let fixture: ComponentFixture<EmployeeNewRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeNewRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmployeeNewRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
