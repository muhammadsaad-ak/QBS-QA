import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditItemsInspectionCardsComponent } from './edit-items-inspection-cards.component';

describe('EditItemsInspectionCardsComponent', () => {
  let component: EditItemsInspectionCardsComponent;
  let fixture: ComponentFixture<EditItemsInspectionCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditItemsInspectionCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditItemsInspectionCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
