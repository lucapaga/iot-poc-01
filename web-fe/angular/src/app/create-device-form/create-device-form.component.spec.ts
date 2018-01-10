import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeviceFormComponent } from './create-device-form.component';

describe('CreateDeviceFormComponent', () => {
  let component: CreateDeviceFormComponent;
  let fixture: ComponentFixture<CreateDeviceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDeviceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDeviceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
