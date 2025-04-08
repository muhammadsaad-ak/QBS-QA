import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationPlanQaComponent } from './evaluation-plan-qa.component';

describe('EvaluationPlanQaComponent', () => {
  let component: EvaluationPlanQaComponent;
  let fixture: ComponentFixture<EvaluationPlanQaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationPlanQaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationPlanQaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
