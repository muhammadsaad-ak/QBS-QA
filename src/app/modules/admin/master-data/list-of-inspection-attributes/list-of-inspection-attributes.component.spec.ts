import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfInspectionAttributesComponent } from './list-of-inspection-attributes.component';

describe('ListOfInspectionAttributesComponent', () => {
  let component: ListOfInspectionAttributesComponent;
  let fixture: ComponentFixture<ListOfInspectionAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfInspectionAttributesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfInspectionAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
