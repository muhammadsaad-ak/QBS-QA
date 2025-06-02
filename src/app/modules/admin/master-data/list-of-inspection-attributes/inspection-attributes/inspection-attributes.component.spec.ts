import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionAttributesComponent } from './inspection-attributes.component';

describe('InspectionAttributesComponent', () => {
  let component: InspectionAttributesComponent;
  let fixture: ComponentFixture<InspectionAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionAttributesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectionAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
