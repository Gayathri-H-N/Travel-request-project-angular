import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedmoduleComponent } from './sharedmodule.component';

describe('SharedmoduleComponent', () => {
  let component: SharedmoduleComponent;
  let fixture: ComponentFixture<SharedmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SharedmoduleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SharedmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
