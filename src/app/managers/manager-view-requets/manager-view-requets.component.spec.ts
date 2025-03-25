import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerViewRequetsComponent } from './manager-view-requets.component';

describe('ManagerViewRequetsComponent', () => {
  let component: ManagerViewRequetsComponent;
  let fixture: ComponentFixture<ManagerViewRequetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagerViewRequetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManagerViewRequetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
