import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicedetailComponent } from './devicedetail.component';

describe('DevicedetailComponent', () => {
  let component: DevicedetailComponent;
  let fixture: ComponentFixture<DevicedetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicedetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicedetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
