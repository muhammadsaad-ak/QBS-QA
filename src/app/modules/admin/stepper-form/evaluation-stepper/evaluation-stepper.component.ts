import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, ViewEncapsulation, inject, } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { qbsAnimations } from '@qbs/animations';
// import { InspectionCharacteristicsService } from 'app/core/other-core-services/module/inspection-characteristics.service';
// import { ItemSamplesService } from 'app/core/other-core-services/module/item-sample.service';
// import { QualitativeResultsService } from 'app/core/other-core-services/module/qualitative-results.service';
// import { UomMasterService } from 'app/core/other-core-services/module/uom-master.service';
// import { InspectionCardService } from 'app/core/other-core-services/module/inspection-card.service';
import { ChangeDetectorRef } from '@angular/core';
import { ItemInspectionCardService } from 'app/core/other-core-services/module/item-inspection-card.service';
import { MatSelectModule } from '@angular/material/select';

/**
 * @title Stepper overview
 */

@Component({
  selector: 'app-evaluation-stepper',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatSelectModule,
],
  templateUrl: './evaluation-stepper.component.html',
  styleUrl: './evaluation-stepper.component.scss'
})
export class EvaluationStepperComponent {
  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private fb: FormBuilder,){}
    

    samples = [
      { id: 1, inspectionTime: '10:30 AM', inspectionBy: 'Mr.kamran', cardColor: '#e8f5e9' },
      { id: 2, inspectionTime: '10:30 AM', inspectionBy: 'Mr.kamran', cardColor: '#ffebee' },
      { id: 3, inspectionTime: '10:30 AM', inspectionBy: 'Mr.kamran', cardColor: '#f5f5f5' },
      { id: 4, inspectionTime: '10:30 AM', inspectionBy: 'Mr.kamran', cardColor: '#e8f5e9' }
    ];

    planPurchaseOrderFormGroup = this._formBuilder.group({
      isActive: [true],
      docNoPO: [''],
      itemCodePO: [''],
      itemDescriptionPO: [''],
      inspectionDateTimePO: [''],
      datePO: [''],
      purchaseOrderPO: [''],
      quantityPO: [''],
      openQuantityPO: [''],
      vendorPO: [''],
      qcLotNoPO: ['', Validators.required],
      receiveQtyPO: ['', Validators.required],
      inspectionQtyPO: ['', Validators.required],
      samplePO: [''],
      locationPO: [''],

  });
  // secondFormGroup = this._formBuilder.group({
  //   secondCtrl: ['', Validators.required],
  // });
  isLinear = false;
  
}





/////////////////////////////////////

