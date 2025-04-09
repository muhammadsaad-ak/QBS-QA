import { TestBed } from '@angular/core/testing';

import { EvaluationPlanQaOrderService } from './evaluation-plan-qa-order.service';

describe('EvaluationPlanQaOrderService', () => {
  let service: EvaluationPlanQaOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluationPlanQaOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
