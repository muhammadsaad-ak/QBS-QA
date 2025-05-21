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
import { ChangeDetectorRef } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { InspectionCardService } from 'app/core/other-core-services/module/inspection-card.service';
import { EvaluationPlanProductionOrderService } from 'app/core/other-core-services/module/evaluation-plan-production-order.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SapPlanProductionOrderService } from 'app/core/other-core-services/module/sap-plan-production-order.service';
import { Router } from '@angular/router';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SAPAllServices } from 'app/core/other-core-services/module/sap-list-all-services.service';
import { QbsSuccessConfirmationService } from '@qbs/services/confirmation/success-confirmation.service';
import { map, switchMap } from 'rxjs';
import { GRNPayloadProduction } from 'app/core/other-core-services/module/sap-list-all-services.service';
import JsBarcode from 'jsbarcode';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; 
import { formatDate } from '@angular/common';



@Component({
  selector: 'app-plan-production-order',
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
    MatTooltipModule,
      MatDatepickerModule,
  MatInputModule,
  MatNativeDateModule
  ],
  templateUrl: './plan-production-order.component.html',
  styleUrl: './plan-production-order.component.scss'
})
export class PlanProductionOrderComponent implements AfterViewInit {
  i: number;
  samplesStatus: boolean | null = null;
  // Plan Prodcution Form groups
  selectedOrder: any;
  qualitativeInspectionForm: FormGroup;
  quantitativeInspectionForm: FormGroup;
  isFormSaved = false; // Initialize to false
  isDropdownOpen = false;
  isValidate = false;
  isEditMode: boolean = false; // Default false, will be true if in Edit QC mode
  productionQcSamples: any[] = [];
  cardCode: any;
  productionQcId: any
  qcSampleID: string | null = null;   //  qcSampleID: string = '';
  selectedSampleId: any;
  productionQCSampleId: any
  currentMode: 'add' | 'edit' = 'add';


  
  // Plan Production DataSources for tables
  dataSourceQualitativeInspection: MatTableDataSource<any>;
  dataSourceQuantitativeInspection: MatTableDataSource<any>;
  dataSourceUoMIIC: MatTableDataSource<any>;
  dataSourceAddQuantitativeIIC: MatTableDataSource<any>;
  
  // Selected row index for UoM
  selectedRowIndexUoM: number = -1;
  
  // Selected UoM Code
  selectedUoMCode: string = '';
  
  // Plan Purchase Display columns
  // displayedColumnsQualitative: string[] = ['parameter', 'passCriteria', 'mandatory', 'result', 'remarks'];
  // displayedColumnsQuantitative: string[] = ['parameterQty', 'uoMId', 'mandatoryQty', 'passCriteriaTarget', 'passCriteriaMax', 'passCriteriaMin', 'result', 'remarks'];
  displayedColumnsQualitative: string[] = ['inspectionCharacteristicName', 'inspectionCharacteristicSingleCriteria', 'isMandatory', 'qualitativeResultId', 'remarks'];
  displayedColumnsQuantitative: string[] = ['inspectionCharacteristicName', 'uoMCode', 'isMandatory', 'target', 'max', 'min', 'quantitativeResult', 'remarks'];
  displayedColumnsUoMIIC: string[] = ['code', 'description'];
  displayedColumnsAddQuantitativeIIC: string[] = ['inspectionCode', 'inspectionDescription'];
  
  // Static data for UoM
  uomData = [
    { id: 1, uoMCode: 'KG', description: 'Kilogram', isSelected: false },
    { id: 2, uoMCode: 'GM', description: 'Gram', isSelected: false },
    { id: 3, uoMCode: 'LTR', description: 'Liter', isSelected: false },
    { id: 4, uoMCode: 'ML', description: 'Milliliter', isSelected: false },
    { id: 5, uoMCode: 'CM', description: 'Centimeter', isSelected: false }
  ];
  
  // Static data for Add Quantitative
  quantitativeCharacteristics = [
    { id: 1, intCode: 'WT001', description: 'Weight Check', isSelected: false },
    { id: 2, intCode: 'DM001', description: 'Dimension Check', isSelected: false },
    { id: 3, intCode: 'TH001', description: 'Thickness Check', isSelected: false },
    { id: 4, intCode: 'PH001', description: 'pH Level', isSelected: false },
    { id: 5, intCode: 'VS001', description: 'Viscosity', isSelected: false }
  ];

  // your.component.ts

productionShifts = [
  { value: 'A', label: 'SHIFT - A' },
  { value: 'B', label: 'SHIFT - B' },
  { value: 'C', label: 'SHIFT - C' }
];

  
  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _inspectionCardModal: InspectionCardService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _evaluationProductionOrderService: EvaluationPlanProductionOrderService,
    private _sapPlanProductionOrderService: SapPlanProductionOrderService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private _qbsConfirmationService: QbsConfirmationService,
    private _qbsSuccessConfirmationService: QbsSuccessConfirmationService,
    private _SAPAllServices: SAPAllServices,
  ) { }
  planProductionOrderFormGroup = this._formBuilder.group({
    id: [''], 
    intCode: [''], 
    itemCode: [''], 
    itemDescription: [''], 
    inspectionDateTime: [new Date().toISOString(), Validators.required], 
    docDate: [new Date().toISOString(), Validators.required], 
    docNo: ['', Validators.required], 
    warehouse: ['', Validators.required], 
    sampleQuantity: [], 
    openQuantity: [0, [Validators.required, Validators.min(0)]], 
    plannedQuantity: [0, [Validators.required, Validators.min(0)]], 
    qcLotNo: ['', Validators.required], 
    shift: ['', Validators.required],
    machineNo: [''],
    variant: [''], 
    bmrNo: [''],
    mouldNo: [''],
    cavity: [''], 
    cycleTime: [], 
    itemWeight: [''], 
    inspectionQuantity: [], 
    analyzedBy: [''], 
    status: [''],
    remarks: [''],  // remarks:  [''],
    bmrLoc: [''],   // plant
    
    qualitativeInspectionObjects: this.fb.array([]),
    quantitativeInspectionResults: this.fb.array([]),
    inspectionBy: [''],
    qcId: [''],
    result: [0],
    inspectionObjects: this.fb.array([this.createInspectionObject()]),
    
    // vendor: ['a'], 
    // remarks: ['aa'], 
    // isActive: [true], 
    itemId: [''],
    //
    inspectionByModalPP: [''], // No direct mapping, keep empty
    inspectionTimeModalPP: [''], // No direct mapping, keep empty
    itemCodeModalPO: [''], // No direct mapping, keep empty
    inspectionQtyModalPO: [''], // No direct mapping, keep empty
    inspectionByModalPO: [''], // No direct mapping, keep empty
    inspectionTimeModalPO: [''], // No direct mapping, keep empty
    receiveQtyPO: [''], // No direct mapping, keep empty
    // inspectionDateTimePO: [new Date().toISOString()], // API: docDate (Converted to ISO)
    // lineNum: [''], // No direct mapping, keep empty
    sampleName: [''],
    isFlexible: [false],
    samplesStatus: [false],
    isPerformed: [true],
    isPostedToSap: [false],
    isClosed: [false],
    overallStatus: [false],
    // barcodeValue: ['', Validators.required],
    barcodeValue: [''],
    receiptQuantity: [],
    operatedBy: [],
    producedQuantity: [],
    productionDate: [null],
    productionShift: [null],
    inspectionDateTimeSamples: [new Date().toISOString()], // ✅ Correct ISO format
  });

  createInspectionObject(): FormGroup {
    return this.fb.group({
      qualitativeInspectionMappingId: [''],
      quantitativeInspectionMappingId: [''],
      qualitativeResultId: [''],
      isQualitativeResultPassed: [true],
      // quantitativeResult: [0],
      isQuantitativeResultPassed: [true],
      remarks: ['']
    });
  }

  get inspectionObjects(): FormArray {
    return this.planProductionOrderFormGroup.get('inspectionObjects') as FormArray;
  }

  // getQualitativeResultPassStatusResults(index: number): FormArray {
  //   return this.planProductionOrderFormGroup
  //     .get('qualitativeInspectionObjects')?.get(`${index}.qualitativeResultPassStatusResults`) as FormArray;
  // }

  getQualitativeResultPassStatusResults(index: number): any[] {
    const formArray = this.qualitativeInspectionObjects;
    const formGroup = formArray.at(index) as FormGroup;
    const resultControl = formGroup.get('qualitativeResultPassStatusResults');
  
    return resultControl?.value || [];
  }

  addInspectionObject() {
    this.inspectionObjects.push(this.createInspectionObject());
  }

  removeInspectionObject(index: number) {
    this.inspectionObjects.removeAt(index);
  }


  get sampleQuantity(): number {
    return Number(this.planProductionOrderFormGroup.get('sampleQuantity')?.value) || 0;
  }

  // saveForm(): void {
  //   if (this.planProductionOrderFormGroup.valid) {
  //     console.log(this.planProductionOrderFormGroup.value);

  //     const formData = this.planProductionOrderFormGroup.value;
  //     console.log('PAYLOAD BEFORE sampleQuantity:', formData);

  //     const inspectionQuantity: number = Number(formData.inspectionQuantity);
  //     const itemId: string = String(formData.itemId);

  //     this.getSampleQuantity(inspectionQuantity, itemId)
  //       .then(() => {
  //         const updatedFormData = this.planProductionOrderFormGroup.value;
  //         console.log('PAYLOAD AFTER sampleQuantity:', updatedFormData);
  //         console.log('Form Saved!');
  //         this.isFormSaved = true;
  //       })
  //       .catch((error) => {
  //         console.error('Error in getSampleQuantity:', error);
  //       });
  //   } else {
  //     console.error('Form is not valid');
  //   }
  // }

  XonSubmitProductionOrderX(): void {
    this.isValidate = true;
    if (this.planProductionOrderFormGroup.valid) {

      const inspectionQuantity: number = Number(this.planProductionOrderFormGroup.value.inspectionQuantity);
      const itemId: string = String(this.planProductionOrderFormGroup.value.itemId);

      console.log('PAYLOAD BEFORE GET sampleQuantity API:', this.planProductionOrderFormGroup.valid);

      this.getSampleQuantity(inspectionQuantity, itemId).then(() => {

        const formData = this.planProductionOrderFormGroup.value;

        console.log('UPDATED FORM DATA AFTER SAMPLE QTY:', formData);

        const { id, itemCode, itemDescription, inspectionByModalPP, inspectionTimeModalPP, itemCodeModalPO, inspectionQtyModalPO, inspectionByModalPO, inspectionTimeModalPO,receiveQtyPO,
          ...payload } = formData;

        console.log('SENDING Production ORDER PAYLOAD:', payload);

        this.isFormSaved = true; // UI trigger karega
        console.log(payload);
        // return;
        this._evaluationProductionOrderService.AddProductionOrder(payload).subscribe(
          (response) => {
            if (response.isRequestSuccess) {
              console.log('API RUN SUCCESSFULLY.', payload);
              this._snackBar.open('Production Order added successfully!', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-success']
              });
            }
          },
          (error) => {
            this._snackBar.open('Error adding Production order.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        );
      }).catch((error) => {
        console.error('Error in getSampleQuantity:', error);
      });
    } else {
      this.isValidate = false;
      this._snackBar.open('Please fill all mandatory fields.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  onSubmitProductionOrder(): void {
    this.isValidate = true;
  
    if (this.planProductionOrderFormGroup.valid) {
      const inspectionQuantity: number = Number(this.planProductionOrderFormGroup.value.inspectionQuantity);
      const itemId: string = String(this.planProductionOrderFormGroup.value.itemId);
  
      console.log('PAYLOAD BEFORE GET sampleQuantity API:', this.planProductionOrderFormGroup.valid);
  
      this.getSampleQuantity(inspectionQuantity, itemId)
        .then(() => {
          const formData = this.planProductionOrderFormGroup.value;
          const defaultProductionDate: Date = this.planProductionOrderFormGroup.value.productionDate;
          const formattedProductionDate = formatDate(defaultProductionDate, 'dd-MM-yyyy', 'en-PK');
          console.log('Formatted Date:', formattedProductionDate);
          this.planProductionOrderFormGroup.value.productionDate = formattedProductionDate;

  
          console.log('UPDATED FORM DATA AFTER SAMPLE QTY:', formData);
  
          const {
            id, itemCode, itemDescription, inspectionByModalPP, inspectionTimeModalPP,
            itemCodeModalPO, inspectionQtyModalPO, inspectionByModalPO, inspectionTimeModalPO, receiveQtyPO, productionDate, 
            ...payload
          } = formData;
  
          console.log('SENDING Production ORDER PAYLOAD:', payload);
  
          this._evaluationProductionOrderService
            .getQualityStatusQCProduction('production_qc', formData.itemCode, formData.docNo)
            .subscribe({
              next: (qualityResponse) => {
                if (qualityResponse?.data?.isClosed === false) {
                  this._snackBar.open('QC already open for this item. Cannot submit again.', 'Close', {
                    duration: 3000,
                    panelClass: ['snackbar-error']
                  });
                  this.isFormSaved = false;
                  return;
                }
  
                this.isFormSaved = true;
                console.log(payload);
                // return;
                this._evaluationProductionOrderService.AddProductionOrder(payload).subscribe(
                  (response) => {
                    if (response.isRequestSuccess) {
                      console.log('API RUN SUCCESSFULLY.', payload);
                      this._snackBar.open('Production Order added successfully!', 'Close', {
                        duration: 3000,
                        panelClass: ['snackbar-success']
                      });
                    }
                  },
                  (error) => {
                    this._snackBar.open('Error adding Production order.', 'Close', {
                      duration: 3000,
                      panelClass: ['snackbar-error']
                    });
                  }
                );
              },
              error: (error) => {
                console.error('Error in getQualityStatusQCProduction:', error);
              }
            });
        })
        .catch((error) => {
          console.error('Error in getSampleQuantity:', error);
          this._snackBar.open('Error fetching sample quantity.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        });
    } else {
      this.isValidate = false;
      this._snackBar.open('Please fill all mandatory fields.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  // GET API CALL TO UPDATE sampleQuantity
  getSampleQuantity(inspectionQuantity: number, itemId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._evaluationProductionOrderService.getSampleQuantityRange(inspectionQuantity, itemId).subscribe(
        (response) => {
          console.log('API RESPONSE:', response);
          if (response.isRequestSuccess) {
            const sampleQuantity = response.data;
            console.log('RECEIVED sampleQuantity:', sampleQuantity);
            this.planProductionOrderFormGroup.get('sampleQuantity')?.setValue(sampleQuantity);
            resolve();
          }
        },
        (error) => {
          console.error('ERROR FETCHING SAMPLE QUANTITY:', error);
          this._snackBar.open('ERROR FETCHING SAMPLE QUANTITY.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
          reject(error);
        }
      );
    });
  }


  cancelForm() {
    // Reset the form or navigate away
    this.planProductionOrderFormGroup.reset();
    // Or navigate back to previous page
    // this.router.navigate(['/previous-page']);
  }

  

  // setInspectionDateTime() {
  //   const now = new Date();
  //   const formattedDateTime = now.toLocaleString('en-US', {
  //     year: 'numeric',
  //     month: '2-digit',
  //     day: '2-digit',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit',
  //     hour12: false
  //   });

  //   this.planProductionOrderFormGroup.get('inspectionDateTime')?.setValue(formattedDateTime);
  // }

  

  isLinear = false;
  
  // Get form array controls
  get qualitativeInspectionObjects(): FormArray {
    return this.planProductionOrderFormGroup.get('qualitativeInspectionObjects') as FormArray;
  }
  
  get quantitativeInspectionResults(): FormArray {
    return this.planProductionOrderFormGroup.get('quantitativeInspectionResults') as FormArray;
  }
  


  samplesProductionOrder = [
    // { id: 1, inspectionTime: '11:54 AM', inspectionBy: 'Mr.Hamza', cardColor: '#e8f5e9' },
    // { id: 2, inspectionTime: '08:12 AM', inspectionBy: 'Mr.Hamza', cardColor: '#ffebee' },
    
  ];

  nextSampleId: number = 1; // Since you already have samples 1-4

  getProductionByQcCode(itemCode: string, docNo: number, lineNum: number) {
    this._sapPlanProductionOrderService.GetProductionQCId(itemCode, docNo, lineNum).subscribe({
      next: (response) => {
        this.productionQcId = response.data;
        this.planProductionOrderFormGroup.patchValue({
          // inspectionBy: response.inspectionBy || '', 
          inspectionDateTime: response.inspectionDateTime || new Date().toISOString()
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('QC SERVICE ERROR:', err);
      }
    });
  }
  handleSampleProductionOrder() {
    if(this.isEditMode) {
      this.updateSampleForProductionOrder()
    } else {
      this.addNewSampleForProductionOrder()
    }
  }

  updateSampleForProductionOrder(): void {
    if (!this.planProductionOrderFormGroup.valid) {
      console.error("FORM IS INVALID");
      console.log("FORM ERRORS:", this.planProductionOrderFormGroup.errors);
      console.log("FORM VALUE:", this.planProductionOrderFormGroup.value);
      console.log("INSPECTION BY ERRORS:", this.planProductionOrderFormGroup.get('inspectionBy')?.errors);
      console.log("INSPECTION DATETIME ERRORS:", this.planProductionOrderFormGroup.get('inspectionDateTime')?.errors);
      this.planProductionOrderFormGroup.markAllAsTouched();
      return;
    }

    if (!this.productionQcId || !this.qcSampleID) {
      console.error('QC ID OR SAMPLE ID IS MISSING, CANNOT PROCEED!', { productionQcId: this.productionQcId, qcSampleID: this.qcSampleID });
      return;
    }

    const formValue = this.planProductionOrderFormGroup.value;

    // STEP 1: PREPARE QUALITATIVE INSPECTIONS
    const qualitativeInspections = formValue.qualitativeInspectionObjects?.map((item: any) => {
      const selectedStatus = item?.qualitativeResultPassStatusResults?.find(
        (status: any) => status.qualitativeResultId === item.qualitativeResultId
      );
      return {
        qualitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || "",
        quantitativeInspectionMappingId: null,
        qualitativeResultId: item?.qualitativeResultId || null,
        isQualitativeResultPassed: selectedStatus ? selectedStatus.isPassed : false,
        quantitativeResult: 0,
        isQuantitativeResultPassed: false,
        remarks: item?.remarks || "",
        // id: item?.id || null
      };
    }) || [];

    // STEP 2: PREPARE QUANTITATIVE INSPECTIONS
    const quantitativeInspections = formValue.quantitativeInspectionResults?.map((item: any) => {
      const resultValue = item?.result ? parseFloat(item.result) : 0;
      return {
        qualitativeInspectionMappingId: null,
        quantitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || null,
        qualitativeResultId: null,
        isQualitativeResultPassed: false,
        // quantitativeResult: item?.result !== undefined && item?.result !== null ? parseFloat(item.result) : 0,
        quantitativeResult: resultValue,
        isQuantitativeResultPassed: item?.result !== undefined &&
          !isNaN(resultValue) &&
          resultValue >= (item.min ?? 0) &&
          resultValue <= (item.max ?? 0),
        remarks: item?.remarks || "",
        // id: item?.id || null

      };
    }) || [];

    // STEP 3: COMBINE QUALITATIVE AND QUANTITATIVE INSPECTIONS
    const inspectionObjects = [...qualitativeInspections, ...quantitativeInspections];

    // const hasPassingQualitative = inspectionObjects
    //   .filter((inspection: any) => inspection.qualitativeResultId !== null)
    //   .some((inspection: any) => inspection.isQualitativeResultPassed === true);
    // const hasPassingQuantitative = inspectionObjects
    //   .filter((inspection: any) => inspection.quantitativeInspectionMappingId !== null)
    //   .some((inspection: any) => inspection.isQuantitativeResultPassed === true);

    const hasPassingQualitative = inspectionObjects
      .filter((inspection: any) => inspection.qualitativeResultId !== null)
      .every((inspection: any) => inspection.isQualitativeResultPassed === true);
    const hasPassingQuantitative = inspectionObjects
      .filter((inspection: any) => inspection.quantitativeInspectionMappingId !== null)
      .every((inspection: any) => inspection.isQuantitativeResultPassed === true);

    const isSamplePassed = hasPassingQualitative && hasPassingQuantitative;

    // STEP 4: CREATING THE FINAL PAYLOAD
    const updatedSamplePayload = {
      id: this.qcSampleID,
      name: formValue.sampleName,
      inspectionDateTime: formValue.inspectionDateTime || new Date().toISOString(),
      inspectionBy: formValue.inspectionBy || "",
      qcId: this.productionQcId.id,
      isSamplePassed: isSamplePassed,
      inspectionObjects: inspectionObjects
    };

    console.log('FINAL PAYLOAD:', updatedSamplePayload);

    // STEP 5: CALLING THE UPDATE API
    this._sapPlanProductionOrderService.UpdateProductionQcSample(updatedSamplePayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        const addedSampleStatus = isSamplePassed ? 'Passed' : 'Failed';
        this._snackBar.open(`Sample updated successfully with status ${addedSampleStatus}`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });

        // API CALL TO FETCH isSamplePassed - @IAK
        this._sapPlanProductionOrderService.getIsSamplePassedListByProdQcId(this.productionQcId.id).subscribe({
          next: (isSamplePassedList: boolean[]) => {
            console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);

            this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
            console.log('samplesStatus:', this.samplesStatus);

            this.planProductionOrderFormGroup.patchValue({
              samplesStatus: this.samplesStatus
            });
          },
          error: (error) => {
            console.error('getIsSamplePassedListByQcId API Error:', error);
            this._snackBar.open('Failed to fetch sample passed list.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });

        // Update existing sample in local array        
        const existingSampleIndex = this.productionQcSamples.findIndex(sample => sample.id === this.qcSampleID);
        if (existingSampleIndex !== -1) {
          this.productionQcSamples[existingSampleIndex] = {
            ...this.productionQcSamples[existingSampleIndex],
            inspectionDateTime: formValue.inspectionDateTime,
            inspectionBy: formValue.inspectionBy
          };
          this.productionQcSamples = [...this.productionQcSamples];
          this.selectedSampleId = this.qcSampleID;
        }

        // this.planProductionOrderFormGroup.patchValue({
        //   inspectionDateTime: this.productionQcSamples[existingSampleIndex]?.inspectionDateTime,
        //   inspectionBy: this.productionQcSamples[existingSampleIndex]?.inspectionBy
        // });

        this.ListAllProductionQCSamplesByQcId(this.productionQcId.id);
        this.closeDialog();
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });
  }
  XupdateSampleForProductionOrder(): void {
    if (!this.planProductionOrderFormGroup.valid) {
      console.error("FORM IS INVALID");
      console.log("FORM ERRORS:", this.planProductionOrderFormGroup.errors);
      console.log("FORM VALUE:", this.planProductionOrderFormGroup.value);
      console.log("INSPECTION BY ERRORS:", this.planProductionOrderFormGroup.get('inspectionBy')?.errors);
      console.log("INSPECTION DATETIME ERRORS:", this.planProductionOrderFormGroup.get('inspectionDateTime')?.errors);
      this.planProductionOrderFormGroup.markAllAsTouched();
      return;
    }

    if (!this.productionQcId || !this.qcSampleID) {
      console.error('QC ID OR SAMPLE ID IS MISSING, CANNOT PROCEED!', { productionQcId: this.productionQcId, qcSampleID: this.qcSampleID });
      return;
    }
   
    const formValue = this.planProductionOrderFormGroup.value;

    // STEP 1: PREPARE QUALITATIVE INSPECTIONS
    const qualitativeInspections = formValue.qualitativeInspectionObjects?.map((item: any) => {
      const selectedStatus = item?.qualitativeResultPassStatusResults?.find(
        (status: any) => status.qualitativeResultId === item.qualitativeResultId
      );
      return {
        qualitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || "",
        quantitativeInspectionMappingId: null,
        qualitativeResultId: item?.qualitativeResultId || null,
        isQualitativeResultPassed: selectedStatus ? selectedStatus.isPassed : false,
        quantitativeResult: 0,
        isQuantitativeResultPassed: false,
        remarks: item?.remarks || "",
        id: item?.id || null
      };
    }) || [];

    // STEP 2: PREPARE QUANTITATIVE INSPECTIONS
    const quantitativeInspections = formValue.quantitativeInspectionResults?.map((item: any) => {
      const resultValue = item?.result ? parseFloat(item.result) : 0;
      return {
        qualitativeInspectionMappingId: null,
        quantitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || null,
        qualitativeResultId: null,
        isQualitativeResultPassed: false,
        quantitativeResult: item?.result !== undefined && item?.result !== null ? parseFloat(item.result) : 0,
        isQuantitativeResultPassed: item?.result !== undefined &&
          !isNaN(resultValue) &&
          resultValue >= (item.min ?? 0) &&
          resultValue <= (item.max ?? 0),
        remarks: item?.remarks || "",
        id: item?.id || null

      };
    }) || [];

    // STEP 3: COMBINE QUALITATIVE AND QUANTITATIVE INSPECTIONS
    const inspectionObjects = [...qualitativeInspections, ...quantitativeInspections];

    // STEP 4: CREATING THE FINAL PAYLOAD
    const updatedSamplePayload = {
      id: this.qcSampleID,
      // inspectionDateTime: formValue.inspectionDateTime || new Date().toISOString(),
      inspectionDateTime: formValue.inspectionDateTimeSamples || new Date().toISOString(),
      inspectionBy: formValue.inspectionBy || "",
      qcId: this.productionQcId.id,
      inspectionObjects: inspectionObjects
    };

    console.log('FINAL PAYLOAD:', updatedSamplePayload);

    // STEP 5: CALLING THE UPDATE API
    this._sapPlanProductionOrderService.UpdateProductionQcSample(updatedSamplePayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        
         const existingSampleIndex = this.productionQcSamples.findIndex(sample => sample.id === this.qcSampleID);

    if (existingSampleIndex !== -1) {
      // Update only the specific sample details
      this.productionQcSamples[existingSampleIndex] = {
        ...this.productionQcSamples[existingSampleIndex],
        inspectionDateTime: this.planProductionOrderFormGroup.get('inspectionDateTime')?.value,
        inspectionBy: this.planProductionOrderFormGroup.get('inspectionBy')?.value
      };
          this.productionQcSamples = [...this.productionQcSamples];

                // Keep the selected card after update
                this.selectedSampleId = this.qcSampleID;
    } else {
      console.error(`Sample with ID ${this.qcSampleID} not found in productionQcSamples`);
    }

    // Instead of reloading the full list, just update the form fields
    this.planProductionOrderFormGroup.patchValue({
      inspectionDateTime: this.productionQcSamples[existingSampleIndex]?.inspectionDateTime,
      inspectionBy: this.productionQcSamples[existingSampleIndex]?.inspectionBy
    });

        // Refresh the samples list
        // this.ListAllPurchaseQCSamplesByQcId(this.purchaseQcId.id);
       const isNewSample = !this.productionQcSamples.some(sample => sample.id === this.qcSampleID);
    
    if (isNewSample) {
      const newSample = {
        id: this.nextSampleId,
        inspectionTime: this.planProductionOrderFormGroup.get('inspectionDateTime').value,
        inspectionBy: this.planProductionOrderFormGroup.get('inspectionBy').value,
        cardColor: this.getRandomCardColor()
      };
      
      this.samplesProductionOrder.push(newSample);
      this.nextSampleId++;
    }
        this.closeDialog();
      },
      error: (error) => {
        console.error('API Error:', error);
        // Handle error appropriately
      }
    });
  }


  addNewSampleForProductionOrder(): void {
    if (!this.planProductionOrderFormGroup.valid) {
      console.error("FORM IS INVALID");
      console.log("FORM ERRORS:", this.planProductionOrderFormGroup.errors);
      console.log("FORM VALUE:", this.planProductionOrderFormGroup.value);
      this.planProductionOrderFormGroup.markAllAsTouched();
      return;
    }

    if (!this.productionQcId) {
      console.error('QC ID IS MISSING, CANNOT PROCEED!');
      return;
    }

    const formValue = this.planProductionOrderFormGroup.value;

    // LOG qualitativeInspectionObjects
    console.log("Qualitative Inspection Objects:", this.qualitativeInspectionObjects.value);

    // QUALITATIVE
    const qualitativeInspections = formValue.qualitativeInspectionObjects?.map((item: any) => {
      const selectedStatus = item?.qualitativeResultPassStatusResults?.find(
        (status: any) => status.qualitativeResultId === item.qualitativeResultId
      );
      return {
        qualitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || "",
        quantitativeInspectionMappingId: null,
        qualitativeResultId: item?.qualitativeResultId || null,
        isQualitativeResultPassed: selectedStatus ? selectedStatus.isPassed : false,
        quantitativeResult: 0,
        isQuantitativeResultPassed: false,
        remarks: item?.remarks || ""
      };
    }) || [];
  
    // QUANTITATIVE
    const quantitativeInspections = formValue.quantitativeInspectionResults?.map((item: any) => {
      const resultValue = item?.result ? parseFloat(item.result) : 0;
      return {
        qualitativeInspectionMappingId: null,
        quantitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || null,
        qualitativeResultId: null,
        isQualitativeResultPassed: false,
        // quantitativeResult: resultValue,
        quantitativeResult: item?.result !== undefined && item?.result !== null ? parseFloat(item.result) : 0,
        // isQuantitativeResultPassed: !isNaN(resultValue) &&
        //   resultValue >= (item.min ?? 0) &&
        //   resultValue <= (item.max ?? 0),
        isQuantitativeResultPassed: item?.result !== undefined &&
          !isNaN(resultValue) &&
          resultValue >= (item.min ?? 0) &&
          resultValue <= (item.max ?? 0),
        remarks: item?.remarks || ""
      };
    }) || [];

    // COMBINING BOTH INSPECTIONS - @IAK
    const inspectionObjects = [...qualitativeInspections, ...quantitativeInspections];
    const hasPassingQualitative = inspectionObjects
      .filter((inspection: any) => inspection.qualitativeResultId !== null)
      .every((inspection: any) => inspection.isQualitativeResultPassed === true);
    const hasPassingQuantitative = inspectionObjects
      .filter((inspection: any) => inspection.quantitativeInspectionMappingId !== null)
      .every((inspection: any) => inspection.isQuantitativeResultPassed === true);
    const isSamplePassed = hasPassingQualitative && hasPassingQuantitative;
    console.log("hasPassingQualitative:", hasPassingQualitative);
    console.log("hasPassingQuantitative:", hasPassingQuantitative);
    console.log("isSamplePassed:", isSamplePassed);

    // FINAL PAYLOAD
    const newSamplePayload = {
      name: `sample-${this.nextSampleId}`,
      inspectionDateTime: new Date().toISOString(),
      inspectionBy: formValue.inspectionBy || "",
      qcId: this.productionQcId.id,
      isSamplePassed: isSamplePassed,
      // inspectionObjects: [...qualitativeInspections, ...quantitativeInspections]
      inspectionObjects: inspectionObjects
    };
  
    console.log('FINAL PAYLOAD:', newSamplePayload);
  
    // API CALL
    this._sapPlanProductionOrderService.addProductionQcSample(newSamplePayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        const addedSampleStatus = isSamplePassed ? 'Passed' : 'Failed';
        this._snackBar.open(`Sample added successfully with status ${addedSampleStatus}`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });

        // API CALL TO FETCH isSamplePassed - @IAK
        this._sapPlanProductionOrderService.getIsSamplePassedListByProdQcId(this.productionQcId.id).subscribe({
          next: (isSamplePassedList: boolean[]) => {
            console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);

            this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
            console.log('SAMPLES STATUS ~ this.samplesStatus:', this.samplesStatus);

            this.planProductionOrderFormGroup.patchValue({
              samplesStatus: this.samplesStatus
            });
          },
          error: (error) => {
            console.error('getIsSamplePassedListByProdQcId API Error:', error);
            this._snackBar.open('Failed to fetch samples against this Production Order.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });

        // ✅ Add new sample card ONLY once here
        const newSample = {
          id: this.nextSampleId,
          inspectionTime: this.planProductionOrderFormGroup.get('inspectionDateTime')?.value,
          inspectionBy: this.planProductionOrderFormGroup.get('inspectionBy')?.value,
          // cardColor: this.getRandomCardColor()
          cardColor: isSamplePassed ? 'lightgreen' : 'lightcoral'
        };
        console.log("SAMPLE CARD COLOR:", newSample.cardColor);

        this.samplesProductionOrder.push(newSample);
        this.nextSampleId++;
  
        // ✅ Clear form arrays after successful submission
        this.qualitativeInspectionObjects.clear();
        this.quantitativeInspectionResults.clear();
  
        // ✅ Refresh all samples list
        this.ListAllProductionQCSamplesByQcId(this.productionQcId.id);
  
        this.closeDialog();
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });
  }

  getRandomCardColor(): string {
    const colors = ['#e8f5e9', '#ffebee', '#f5f5f5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
 
  
  @ViewChild('dialogTemplateItemsPP') dialogTemplateItemsPP;
  dataSourceItems = new MatTableDataSource([]);
  selectedControlAccountRowIndex: number = -1;
  
  ngOnInit() {
    this.planProductionOrderFormGroup.valueChanges.subscribe(() => {
      this.isPlanProductionOrderFormGroupValid();
    });
    // SUBSCRIBE TO barcodeValue CHANGES TO UPDATE BARCODE
    this.planProductionOrderFormGroup
      .get('barcodeValue')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.generateBarcode(value);
        }
      });

    this.selectedOrder = history.state.selectedOrder; // Access the passed data
    this.isEditMode = history.state.from === 'evaluationPlan'; // Set edit mode if coming from Edit QC

    if (this.selectedOrder) {
      this.populateProductionOrderForm(this.selectedOrder); // Populate the form with the data
      this.getItemId(this.selectedOrder.itemCode);
    }

    if (this.selectedOrder) {
      if (this.isEditMode) {
        this.populateEditProductionOrderForm(this.selectedOrder); // Call Edit QC function
        this.ListAllProductionQCSamplesByQcId(this.selectedOrder.id)
        
        // API CALL TO FETCH isSamplePassed - @IAK
        this._sapPlanProductionOrderService.getIsSamplePassedListByProdQcId(this.selectedOrder.id).subscribe({
          next: (isSamplePassedList: boolean[]) => {
            console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);

            // this.samplesStatus = isSamplePassedList.some(status => status === true);
            this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
            console.log('SAMPLES STATUS ~ this.samplesStatus:', this.samplesStatus);

            this.planProductionOrderFormGroup.patchValue({
              samplesStatus: this.samplesStatus
            });
          },
          error: (error) => {
            console.error('getIsSamplePassedListByQcId API Error:', error);
            this._snackBar.open('No sample has been created for this Production Order yet', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });

        console.log('HAHA', this.selectedOrder)
      } else {
        this.populateProductionOrderForm(this.selectedOrder); // Call Perform QC function
      }
      this.getItemId(this.selectedOrder.itemCode);
    }

    if (!this.isEditMode) {
      this._evaluationProductionOrderService.getProductionQCCode().subscribe((productionQCCode) => {
        console.log('Production QC Code:', productionQCCode); // Debugging ke liye
        console.log('Production QC Code:', productionQCCode.data);

        const intCodeNumber = productionQCCode.data?.toString() ?? '';
        let formattedIntCode = intCodeNumber;
        if (formattedIntCode.length < 5) {
          formattedIntCode = formattedIntCode.padStart(5, '0');
        }
        const formattedIntCodePlanProduction = `PRDQC-${formattedIntCode}`;
        this.planProductionOrderFormGroup.get('intCode')?.setValue(formattedIntCodePlanProduction);

        // const fullCode = `PQC-000${productionQCCode.data || ''}`; // Code format
        // this.planProductionOrderFormGroup.get('intCode')?.setValue(fullCode); // Yahan correct form group use karo
      });
    }


    // Initialize form groups
    // this.qualitativeInspectionForm = this.fb.group({
    //   qualitativeObjects: this.fb.array([])
    // });
    
    // this.quantitativeInspectionForm = this.fb.group({
    //   quantitativeObjects: this.fb.array([])
    // });
    
    // Add static qualitative inspection data
    // this.addQualitativeData();
    
    // Add static quantitative inspection data
    // this.addQuantitativeData();

    // this.setInspectionDateTime(); // Fetch date-time on load

    
    // Initialize data sources
    this.dataSourceQualitativeInspection = new MatTableDataSource(this.qualitativeInspectionObjects.controls);
    this.dataSourceQuantitativeInspection = new MatTableDataSource(this.quantitativeInspectionResults.controls);
    this.dataSourceUoMIIC = new MatTableDataSource(this.uomData);
    this.dataSourceAddQuantitativeIIC = new MatTableDataSource(this.quantitativeCharacteristics);
  }

  populateProductionOrderForm(data: any): void {
    console.log('Selected Production Order:', data);
    const cavity = Number(data.cavity);
    const cycleTime = Number(data.cycleTime);
    
    // const inspectionQuantity = !isNaN(cavity) && !isNaN(cycleTime) ? cavity * cycleTime : 0;
    const hoursInSeconds = 8 * 3600;
    const producedQuantity = (!isNaN(cavity) && !isNaN(cycleTime) && cycleTime > 0) 
    ? (hoursInSeconds / cycleTime) * cavity : 0;
    
    this.planProductionOrderFormGroup.patchValue({
      itemCode: data.itemCode ?? 'N/A',
      itemDescription: data.itemDescription ?? 'N/A',
      inspectionDateTime: new Date().toISOString(), // Add missing field
      docDate: data.docDate,
      docNo: data.docNo.toString(), // Convert to string
      warehouse: data.warehouse,
      openQuantity: data.openQty,
      plannedQuantity: data.qty ?? '-', // ✅ Same as qty
      receiveQtyPO: '', // No direct mapping
      // inspectionDateTimePO: new Date().toISOString(), // ✅ Use current date
      qcLotNo: data.lotNo ?? 'N/A',
      shift: data.shift ?? 'N/A',
      machineNo: data.machine ?? 'N/A',
      bmrNo: data.bmr ?? 'N/A',
      mouldNo: data.mold ?? 'N/A',
      cavity: data.cavity !== undefined ? data.cavity.toString() : 'N/A', // ✅ Convert safely
      cycleTime: data.cycleTime ?? 'N/A', // ✅ Convert safely
      itemWeight: data.weight !== undefined ? data.weight.toString() : 'N/A', // ✅ Convert safely
      variant: data.variant ?? 'N/A',
      analyzedBy: data.analyzedBy ?? '', // ✅ Ensure empty string if not provided
      status: data.status ?? false, // status: data.status ?? 'N/A', // ✅ Ensure default value
      bmrLoc: data.bmrLoc ?? 'N/A',
      producedQuantity: producedQuantity,
      // inspectionQuantity: producedQuantity,
      
    });
  }

  populateEditProductionOrderForm(data: any): void {
    console.log('Populating Edit QC Form:', data);
    // FORMATTING intCode
    const rowIntCode = data.intCode ?? '';
    // const formattedIntCode = `PQC-${rowIntCode.toString().padStart(5, '0')}`;
    let formattedIntCode = rowIntCode.toString();
    if (formattedIntCode.length < 5) {
      formattedIntCode = formattedIntCode.padStart(5, '0');
    }
    const formattedIntCodePlanProduction = `PRDQC-${formattedIntCode}`;
    this.planProductionOrderFormGroup.patchValue({
      // intCode: formattedIntCode ?? "",  // intCode: data.intCode ?? "",
      intCode: formattedIntCodePlanProduction ?? "",
      itemCode: data.itemCode ?? "",
      itemDescription: data.itemDescription ?? "",
      openQuantity: data.openQuantity ?? 0,
      analyzedBy: data.analyzedBy,
      status: data.status ?? "",
      sampleQuantity: data.sampleQuantity ?? 0,
      qcLotNo: data.qcLotNo ?? "",
      shift: data.shift ?? "",
      machineNo: data.machineNo ?? 'N/A',
      variant: data.variant ?? 'N/A',
      bmrNo: data.bmrNo ?? 'N/A',
      mouldNo: data.mouldNo ?? 'N/A',
      cavity: data.cavity,
      cycleTime: data.cycleTime ?? 'N/A',
      itemWeight: data.itemWeight ?? 'N/A',
      inspectionQuantity: data.inspectionQuantity,
      id: data.id,
      bmrLoc: data.bmrLoc ?? 'N/A',
      remarks: data.remarks ?? 'N/A',
      isClosed: data.isClosed === true ? true : false,
      receiptQuantity: data.receiptQuantity,
      operatedBy: data.operatedBy,
      productionShift: data.productionShift,
       inspectionDateTime: data.inspectionDateTime 
    });
  }

  
  
  ngAfterViewInit() {
    this.cdr.detectChanges();
    // GENERATE BARCODE WITH INITIAL VALUE IF EXISTS
    const barcodeValue = this.planProductionOrderFormGroup.get('barcodeValue')?.value;
    if (barcodeValue) {
      this.generateBarcode(barcodeValue);
    }
    this.cdr.detectChanges();
  }
  
  // Add static qualitative data
  // addQualitativeData() {
  //   const qualitativeData = [
  //     { parameter: 'Visual Inspection Color', passCriteria: 'No visible defects', mandatory: true, result: '', remarks: '' },
  //     { parameter: 'Color Check', passCriteria: 'Matches standard color', mandatory: true, result: '', remarks: '' },
  //     { parameter: 'Odor Test', passCriteria: 'No unusual odor', mandatory: false, result: '', remarks: '' },
  //     { parameter: 'Package Integrity', passCriteria: 'No damage to packaging', mandatory: true, result: '', remarks: '' },
  //     { parameter: 'Label Verification', passCriteria: 'All labels present and correct', mandatory: true, result: '', remarks: '' }
  //   ];
    
  //   qualitativeData.forEach(item => {
  //     this.qualitativeInspectionObjects.push(
  //       this.fb.group({
  //         parameter: [item.parameter],
  //         passCriteria: [item.passCriteria],
  //         mandatory: [item.mandatory],
  //         result: [item.result],
  //         remarks: [item.remarks]
  //       })
  //     );
  //   });
  // }
  
  // // Add static quantitative data
  // addQuantitativeData() {
  //   const quantitativeData = [
  //     { parameterQty: 'Weight', uoMId: 'KG', mandatoryQty: true, passCriteriaTarget: '10.0', passCriteriaMax: '10.5', passCriteriaMin: '9.5', result: '', remarks: '' },
  //     { parameterQty: 'Length', uoMId: 'CM', mandatoryQty: true, passCriteriaTarget: '20.0', passCriteriaMax: '20.2', passCriteriaMin: '19.8', result: '', remarks: '' },
  //     { parameterQty: 'Width', uoMId: 'CM', mandatoryQty: true, passCriteriaTarget: '15.0', passCriteriaMax: '15.2', passCriteriaMin: '14.8', result: '', remarks: '' },
  //     { parameterQty: 'Height', uoMId: 'CM', mandatoryQty: false, passCriteriaTarget: '5.0', passCriteriaMax: '5.2', passCriteriaMin: '4.8', result: '', remarks: '' },
  //     { parameterQty: 'Volume', uoMId: 'ML', mandatoryQty: false, passCriteriaTarget: '500.0', passCriteriaMax: '510.0', passCriteriaMin: '490.0', result: '', remarks: '' }
  //   ];
    
    // quantitativeData.forEach(item => {
    //   this.quantitativeInspectionObjects.push(
    //     this.fb.group({
    //       parameterQty: [item.parameterQty],
    //       uoMId: [item.uoMId],
    //       mandatoryQty: [item.mandatoryQty],
    //       passCriteriaTarget: [item.passCriteriaTarget],
    //       passCriteriaMax: [item.passCriteriaMax],
    //       passCriteriaMin: [item.passCriteriaMin],
    //       result: [item.result],
    //       remarks: [item.remarks]
    //     })
    //   );
    // });
  

  // ListAllProductionQCSamplesByQcId(productionQcId: string) {
  //   this._sapPlanProductionOrderService.ListAllProductionQCSamplesByQcId(productionQcId).subscribe({
  //     next: (response) => {
  //       this.productionQcSamples = response.data;
  //       console.log(this.productionQcSamples, 'Production QC Samples');
  //     },
  //     error: (err) => {
  //       console.error('SERVICE ERROR:', err);
  //     }
  //   })
  // }

  ListAllProductionQCSamplesByQcId(productionQcId: string) {
    this._sapPlanProductionOrderService.ListAllProductionQCSamplesByQcId(productionQcId).subscribe({
      next: (response) => {
        this.productionQcSamples = response.data.filter(sample => sample.isActive === true); 
        console.log(this.productionQcSamples, 'productionQcSamples');

       if (this.productionQcSamples.length > 0) {
        this.qcSampleID = this.qcSampleID 
          ? this.productionQcSamples.find(sample => sample.id === this.qcSampleID)?.id || this.productionQcSamples[this.productionQcSamples.length - 1].id
          : this.productionQcSamples[this.productionQcSamples.length - 1].id;
      }
      
      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      }
    })
  }


  populateQualitativeAndQuantitativeData(data: any) {
    const qualitativeArray = this.planProductionOrderFormGroup.get('qualitativeInspectionObjects') as FormArray;
    const quantitativeArray = this.planProductionOrderFormGroup.get('quantitativeInspectionResults') as FormArray;

    qualitativeArray.clear();
    quantitativeArray.clear();

    if (data.qualitativeInspectionObjects && data.qualitativeInspectionObjects.length > 0) {
      data.qualitativeInspectionObjects.forEach((item: any) => {
        qualitativeArray.push(
          this.fb.group({
            inspectionCharacteristicName: [item.inspectionCharacteristicName || ''],
            inspectionCharacteristicSingleCriteria: [item.inspectionCharacteristicSingleCriteria || ''],
            inspectionCharacterisicMappingId: [item.inspectionCharacterisicMappingId],
            isMandatory: [item.isMandatory ?? false],
            remarks: [item.remarks || ''],
            qualitativeResultId: [item.qualitativeResultId || ''],
            qualitativeResultPassStatusResults: this.fb.array(
              item.qualitativeResultPassStatusResults?.map((status: any) =>
                this.fb.group({
                  resultDescription: [status.resultDescription || false],
                  qualitativeResultId: [status.qualitativeResultId],
                  isPassed: [status.isPassed]
                })
              ) || []
            )
          })
        );
      });
    }

    if (data.quantitativeInspectionResults && data.quantitativeInspectionResults.length > 0) {
      data.quantitativeInspectionResults.forEach((item: any) => {

        quantitativeArray.push(
          this.fb.group({
            inspectionCharacteristicName: [item.inspectionCharacteristicName || ''],
            inspectionCharacterisicMappingId: [item.inspectionCharacterisicMappingId],
            uoMCode: [item.uoMCode || ''],
            isMandatory: [item.isMandatory ?? false],
            target: [item.target || ''],
            max: [item.max || ''],
            min: [item.min || ''],
            result: [item.result || ''],
            remarks: [item.remarks || '']
          })
        );
      });
    }
  }
  onEditSample(sample: any): void {
     this.currentMode = 'edit';
    console.log('Sample Data:', sample); 
    // alert('Sample ID: ' + (sample ? sample.id : 'undefined')); 
  
    if (!sample || !sample.id) {
      console.error('Sample or sample.id is undefined!');
      return; 
    }

    // 🧼 Clear previous state before patching the new one
    this.qualitativeInspectionObjects.clear();
    this.quantitativeInspectionResults.clear();

    this.qcSampleID = sample.id;

    this.planProductionOrderFormGroup.patchValue({
      sampleName: sample.name || '',
    });

    const dialogRef = this.dialog.open(this.dialogTemplateItemsPP, {
      width: '75vw',  // width: '70vw',
      height: '90vh', // height: '79vh',
      data: {
        qcSampleId: sample.id,
        cardCode: this.cardCode,
        sampleName: sample.name,
        inspectionDateTime: sample.inspectionDateTime,
        inspectionBy: sample.inspectionBy
      }
    });
  
    this.getCardByItemCode(this.selectedOrder.itemCode);
    console.log(this.selectedOrder, 'this.selectedOrder');
    this.getProductionByQcCode(
      this.selectedOrder.itemCode,
      this.selectedOrder.docNo,
      this.selectedOrder.lineNum
    );
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.samplesProductionOrder.findIndex(s => s.id === sample.id);
        if (index !== -1) {
          this.samplesProductionOrder[index] = result;
        }
      }
      console.log('EDIT DIALOG CLOSED');
    });
  }
  
  onItemCodeClickPP(): void {
     this.currentMode = 'add';
    // console.log('Row Index:', rowIndex);
    // this.selectedControlAccountRowIndex = rowIndex;
    // console.log(this.selectedControlAccountRowIndex);
    const dialogRef = this.dialog.open(this.dialogTemplateItemsPP, {
      width: '70vw',
      height: '79vh',
      data: this.cardCode,
    });
    // DYNAMICALLY ADD Validators.required TO inspectionBy
    const inspectionByControl = this.planProductionOrderFormGroup.get('inspectionBy');
    if (inspectionByControl) {
      inspectionByControl.setValidators(Validators.required);
      inspectionByControl.updateValueAndValidity(); // Re-validate the control
    }

    this.getCardByItemCode(this.selectedOrder.itemCode);
    console.log(this.selectedOrder, 'this.selectedOrder')
    this.getProductionByQcCode(
      this.selectedOrder.itemCode,
      this.selectedOrder.docNo,
      this.selectedOrder.lineNum
    )
  }
  

  onUpdateProductionOrderModal(): void {
    this.currentMode = 'add';
    const dialogRef = this.dialog.open(this.dialogTemplateItemsPP, {
      width: '75vw',  // width: '70vw',
      height: '90vh', // height: '79vh',
      data: this.cardCode,
    });
    // DYNAMICALLY ADD Validators.required TO inspectionBy
    const inspectionByControl = this.planProductionOrderFormGroup.get('inspectionBy');
    if (inspectionByControl) {
      inspectionByControl.setValidators(Validators.required);
      inspectionByControl.updateValueAndValidity(); // Re-validate the control
    }

    
    
    this.getCardByItemCode(this.selectedOrder.itemCode);
    console.log(this.selectedOrder, 'this.selectedOrder')
    this.getProductionByQcCode(
      this.selectedOrder.itemCode,
      this.selectedOrder.docNo,
      this.selectedOrder.lineNum
    )

    // IMMEDIATELY LOG FORM STATE
    console.log('Form Initial State (Immediate):', this.planProductionOrderFormGroup.value);
    console.log('Form Valid (Immediate):', this.planProductionOrderFormGroup.valid);
    console.log('Inspection By Errors (Immediate):', this.planProductionOrderFormGroup.get('inspectionBy')?.errors);
    // LOG AFTER 1 SECOND TO CHECK IF STATE CHANGES
    setTimeout(() => {
      console.log('Form Initial State (After 1s):', this.planProductionOrderFormGroup.value);
      console.log('Form Valid (After 1s):', this.planProductionOrderFormGroup.valid);
      console.log('Inspection By Errors (After 1s):', this.planProductionOrderFormGroup.get('inspectionBy')?.errors);
    }, 1000);
    // if (!this.selectedOrder || !this.selectedOrder.itemCode || !this.selectedOrder.docNo || !this.selectedOrder.lineNo) {
    //   console.error('Selected order data is incomplete:', this.selectedOrder);
    //   return;
    // }

    dialogRef.afterClosed().subscribe((result) => {
      console.log('DIALOG CLOSED');
      if (inspectionByControl) {
        inspectionByControl.clearValidators();
        inspectionByControl.updateValueAndValidity();
      }

      
      this.closeDialog();
    });
  }

  // Close dialog
  closeDialog(): void {
    this.dialog.closeAll();
  }
  
  // // UoM interaction methods
  // onUoMQtyClickIIC(index: number): void {
  //   this.selectedRowIndexUoM = index;
  //   // Open UoM dialog (implementation would be in template)
  // }
  
  onRowChangeUoMIIC(row: any): void {
    this.uomData.forEach(item => item.isSelected = false);
    row.isSelected = true;
    this.selectedUoMCode = row.uoMCode;
  }
  
  addSelectedRowUoMIIC(index: number): void {
    const selectedUoM = this.uomData.find(item => item.isSelected);
    if (selectedUoM && index >= 0) {
      this.quantitativeInspectionResults.at(index).get('uoMId').setValue(selectedUoM.uoMCode);
    }
    this.closeDialog();
  }
  
  // // Filter methods
  // applyFilterUoMIIC(event: Event): void {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSourceUoMIIC.filter = filterValue.trim().toLowerCase();
  // }
  
  // Quantitative inspection methods
  onRowChangeAddQuantitativeIIC(row: any): void {
    this.quantitativeCharacteristics.forEach(item => item.isSelected = false);
    row.isSelected = true;
  }
  
  addSelectedRowQuantitativeIIC(): void {
    const selectedChar = this.quantitativeCharacteristics.find(item => item.isSelected);
    if (selectedChar) {
      this.quantitativeInspectionResults.push(
        this.fb.group({
          parameterQty: [selectedChar.description],
          uoMId: [''],
          mandatoryQty: [false],
          passCriteriaTarget: [''],
          passCriteriaMax: [''],
          passCriteriaMin: [''],
          result: [''],
          remarks: ['']
        })
      );
      this.dataSourceQuantitativeInspection = new MatTableDataSource(this.quantitativeInspectionResults.controls);
    }
    this.closeDialog();
  }
  
  applyFilterAddQuantitativeIIC(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAddQuantitativeIIC.filter = filterValue.trim().toLowerCase();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  action1() {
    alert('toggleDropdown action CLICKED');
    console.log("Action 1 selected");
  }

  // GET itemId AGAINST itemCode  - @IAK
  getItemId(itemCode: any): void {
    // console.log(itemCode);
    this._evaluationProductionOrderService.GetItemIdByCode(itemCode).subscribe({
      next: (response) => {
        try {
          if (response && response.data && response.data.length > 0) {
            const itemId = response.data[0].id;
            console.log('Item ID:', itemId);
            if (this.planProductionOrderFormGroup) {
              this.planProductionOrderFormGroup.get('itemId')?.setValue(itemId);
              this.getItemFlexibility(itemId);
            }
          } else {
            console.log('NO ITEMS FOUND IN RESPONSE');
          }
        } catch (error) {
          console.error('PROCESSING ERROR:', error);
        }
      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      },
    });
  }

  getCardByItemCode(itemCode: string) {
    this._sapPlanProductionOrderService.getItemCode(itemCode).subscribe({
      next: (response) => {
        this.cardCode = response.data;
        console.log(this.cardCode);
        if (this.cardCode) {
          // this.planPurchaseOrderFormGroup.patchValue({
          //   itemCode: this.cardCode.itemId || '',
          //   itemDescription: this.cardCode.itemDescription || ''
          // });
          this.populateQualitativeAndQuantitativeData(this.cardCode);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      }
    });
  }
  // GET FLEXIBILITY FROM itemSample AGAINST itemId - @IAK
  getItemFlexibility(ItemId: any): void {
    this._evaluationProductionOrderService.getFlexibilityByItemId(ItemId).subscribe({
      next: (isFlexible: boolean) => {
        console.log('FLEXIBILITY:', isFlexible);
        // 
        if (isFlexible) {
          this.planProductionOrderFormGroup.get('isFlexible')?.setValue(isFlexible);
        }
      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      }
    });
  }
  saveProdOrderRemarks() {
    alert(this.planProductionOrderFormGroup.get('remarks')?.value);
    console.log(this.planProductionOrderFormGroup.get('remarks')?.value);
  }
  // CLOSE OPEN QC FORCEFULLY - @IAK
  closeOpenQC() {
    const OpenPOqcId = this.planProductionOrderFormGroup.get('id')?.value;
    if (!OpenPOqcId) {
      console.error('NO VALID PRODUCTION QC ID FOUND AGAINST THIS PO');
      this._snackBar.open('FAILED TO CLOSE. QC ID MISSING.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }
    const payloadToCloseOpenQC = {
      isPerformed: true,
      isPostedToSap: false,
      isClosed: true,
      overallStatus: this.planProductionOrderFormGroup.get('samplesStatus')?.value,
      id: OpenPOqcId,
      inspectionDateTime: this.planProductionOrderFormGroup.get('inspectionDateTime')?.value,
      remarks: this.planProductionOrderFormGroup.get('remarks')?.value || 'Closed due to unknown reasons',
      isActive: true,
      receiptQuantity: this.planProductionOrderFormGroup.get('receiptQuantity')?.value,
    };
    console.log('PAYLOAD', payloadToCloseOpenQC);
    // FUNCTION TO HANDLE API CALL
    const callCloseQCApi = () => {
      this._evaluationProductionOrderService.updateToCloseOpenQC(payloadToCloseOpenQC).subscribe({
        next: (response) => {
          this._snackBar.open('QC CLOSED SUCCESSFULLY', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
          this.router.navigate(['/evaluation-plan/list-of-evaluation-plan']);
        },
        error: (error) => {
          console.error('ERROR WHILE CLOSING QC.', error);
          this._snackBar.open('FAILED TO CLOSE QC.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        },
      });
    };
    if (payloadToCloseOpenQC.overallStatus === true) {
      const confirmation = this._qbsConfirmationService.open({
        title: 'Close QC',
        message: 'Are you sure you want to close this QC instead of posting to SAP?',
        actions: {
          confirm: {
            label: 'Yes, Close.',
          },
          cancel: {
            label: 'No',
          },
        },
      });
      // subscribe afterClosed ACTION
      confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
          callCloseQCApi();
        }
      });
    } else if (payloadToCloseOpenQC.overallStatus === false) {
      const confirmation = this._qbsConfirmationService.open({
        title: 'Close QC',
        message: 'Are you sure you want to close this QC?',
        actions: {
          confirm: {
            label: 'Yes',
          },
          cancel: {
            label: 'No',
          },
        },
      });
      confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
          callCloseQCApi();
        }
      });
    }
  }
  // SAVE / UPDATE REMARKS WITHOUT CLOSING QC  - @IAK
  saveRemarksProduction() {
    const OpenPOqcId = this.planProductionOrderFormGroup.get('id')?.value;
    if (!OpenPOqcId) {
      console.error('NO VALID PRODUCTION QC ID FOUND AGAINST THIS PO');
      this._snackBar.open('FAILED TO SAVE REMARKS. QC ID MISSING.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }
    const updateRemarksProduction = {
      isPerformed: true,
      isPostedToSap: false,
      isClosed: false,
      overallStatus: this.planProductionOrderFormGroup.get('samplesStatus')?.value,
      id: OpenPOqcId,
      inspectionDateTime: this.planProductionOrderFormGroup.get('inspectionDateTime')?.value,
      remarks: this.planProductionOrderFormGroup.get('remarks')?.value,
      isActive: true,
      receiptQuantity: this.planProductionOrderFormGroup.get('receiptQuantity')?.value,
    };
    console.log('PAYLOAD', updateRemarksProduction);
    this._evaluationProductionOrderService.updateToCloseOpenQC(updateRemarksProduction).subscribe({
      next: (response) => {
        this._snackBar.open('REMARKS SAVED SUCCESSFULLY', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.router.navigate(['/evaluation-plan/list-of-evaluation-plan']);
      },
      error: (error) => {
        console.error('ERROR WHILE SAVING REMARKS QC.', error);
        this._snackBar.open('FAILED TO SAVE REMARKS.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }
  // CLOSE OPEN QC AFTER POSTING TO SAP - @IAK
  closeOpenQCWithPostToSAP() {
    const OpenPOqcId = this.planProductionOrderFormGroup.get('id')?.value;
    if (!OpenPOqcId) {
      console.error('NO VALID PURCHASE QC ID FOUND AGAINST THIS PO');
      this._snackBar.open('FAILED TO CLOSE. QC ID MISSING.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }
    const closeQCPayloadWithPostToSAP = {
      isPerformed: true,
      isPostedToSap: true,
      isClosed: true,
      overallStatus: this.planProductionOrderFormGroup.get('samplesStatus')?.value,
      id: OpenPOqcId,
      inspectionDateTime: this.planProductionOrderFormGroup.get('inspectionDateTime')?.value,
      remarks: this.planProductionOrderFormGroup.get('remarks')?.value || 'Closed on GRN posting',
      isActive: true,
      receiptQuantity: this.planProductionOrderFormGroup.get('receiptQuantity')?.value,
    };
    console.log('CLOSE OPEN QC', closeQCPayloadWithPostToSAP);
    // PUT API CALL TO CLOSE OPEN QC - SET isCLosed TO ture
    this._evaluationProductionOrderService.updateToCloseOpenQC(closeQCPayloadWithPostToSAP).subscribe({
      next: (response) => {
        this._snackBar.open('QC CLOSED SUCCESSFULLY', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.router.navigate(['/evaluation-plan/list-of-evaluation-plan']);
      },
      error: (error) => {
        console.error('ERROR WHILE CLOSING QC.', error);
        this._snackBar.open('FAILED TO CLOSE QC.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }
  // CREATING PRODUCTION GRN POSTING TO SAP INTEGRATION - @IAK
  createGRN(): void {
    const productionQcIdForBMR = this.planProductionOrderFormGroup.get('id')?.value;
    let batchNo: string; 
    // CALLING getProductionQcBMRByQcId TO GET BMR BATCH NO
    this._evaluationProductionOrderService.getProductionQcBMRByQcId(productionQcIdForBMR).subscribe({
      next: (bmr: string) => {
        console.log('getProductionQcBMRByQcId ~ ', bmr);
        batchNo = bmr; 
        console.log('batchNo:', batchNo);
      },
      error: (err) => {
        console.error('Error fetching BMR:', err);
      }
    });
    const docNoProduction = Number(this.planProductionOrderFormGroup.get('docNo')?.value);
    const itemCodeProduction = this.planProductionOrderFormGroup.get('itemCode')?.value;
    const inspectionQuantity = Number(this.planProductionOrderFormGroup.get('inspectionQuantity')?.value);
    const receiptQuantity = Number(this.planProductionOrderFormGroup.get('receiptQuantity')?.value);
    const intQCode = this.planProductionOrderFormGroup.get('intCode')?.value;
    // CALLING getProductionOrdersByID TO FETCH PRODUCTION ORDER DATA
    this._SAPAllServices.getProductionOrdersByID(docNoProduction, itemCodeProduction).subscribe({
      next: (response) => {
        // IF response CONTAINS VALID DATA
        if (response.succeeded && response.data.values.length > 0) {
          const productionOrder = response.data.values[0];
          console.log('batchManaged ~ ',productionOrder.batchManaged);
          // DYNAMICALLY CREATING GRN PAYLOAD
          const payloadReceiptFromProduction = {
            docNum: productionOrder.docNum,
            docEntry: productionOrder.docEntry,
            docDate: productionOrder.docDate,
            itemCode: productionOrder.itemCode,
            productName: productionOrder.productName,
            plannedQuantity: productionOrder.plannedQuantity,
            uoM: productionOrder.uoM,
            inventoryUOM: productionOrder.inventoryUOM,
            productionOrderStatus: productionOrder.productionOrderStatus,
            warehouse: productionOrder.warehouse,
            completedQuantity: receiptQuantity,
            rejectedQuantity: productionOrder.rejectedQuantity,
            machine: productionOrder.machine,
            mold: productionOrder.mold,
            bmr: productionOrder.bmr,
            batchNo: batchNo,
            cavity: productionOrder.cavity,
            cycleTime: productionOrder.cycleTime,
            weight: productionOrder.weight,
            lotNo: productionOrder.lotNo,
            shift: productionOrder.shift,
            variant: productionOrder.variant,
            plant: productionOrder.plant,
            qStatus: 'tYES',
            qCode: intQCode,
              batchManaged: productionOrder.batchManaged,
              batchNumbers: productionOrder.batchManaged ? 
                  [{ batchNumber: batchNo, quantity: inspectionQuantity }] : 
                  [], // EMPTY [] WHEN batchManaged is false
          };
          console.log('DYNAMICALLY CREATED ReceiptFromProduction PAYLOAD', payloadReceiptFromProduction);
          // return; 
          // CALLING goodReceiptProductionGRN WITH DYNAMICALLY CREATED ReceiptFromProduction PAYLOAD
          this._SAPAllServices.goodReceiptProductionGRN(payloadReceiptFromProduction).subscribe({
            next: (ProductionGRNResponse) => {
              console.log('Production GRN Created Successfully:', ProductionGRNResponse);
              if (ProductionGRNResponse.succeeded) {
                // console.log('Receipt from production document created successfully in SAP!');
                console.log('Receipt from production document created successfully in SAP! DocEntry: ' + ProductionGRNResponse.data);
                const snackRefSuccess = this._snackBar.open('Receipt from production document created successfully in SAP!', 'Close', {
                  duration: 3000,
                  panelClass: ['snackbar-success']
                });
                snackRefSuccess.afterDismissed().subscribe(() => {
                  this.closeOpenQCWithPostToSAP();
                });
              } else if (ProductionGRNResponse.succeeded === false || ProductionGRNResponse.statusCode === 422) {
                console.warn(`Failed to create Production GRN: ${ProductionGRNResponse.message}`);
                this._snackBar.open(`Failed to generate Receipt from production document.`, 'Close', {
                  duration: 1500,
                  panelClass: ['snackbar-error']
                }).afterDismissed().subscribe(() => {
                  this._snackBar.open(`Make sure that the consumed quantity of the component item would not cause the item's inventory to fall below zero`, 'Close', {
                    duration: 3000,
                    panelClass: ['snackbar-error']
                  });
                });
              }
            },
            error: (error) => {
              console.error('Failed to generate Receipt from production document:', error);
              console.error('error.message: ', (error.message || 'Unknown error'));
              this._snackBar.open('Failed to generate Receipt from production document: ' + (error.message || 'Unknown error'), 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
              });
            }
          });
        } else {
          console.error('No production order data found in response');
          this._snackBar.open('Failed to fetch production order details', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (err) => {
        console.error('Error fetching production order:', err);
        this._snackBar.open('Failed to fetch production order details: ' + (err.message || 'Unknown error'), 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
  // CONFIRMATION DIALOG TO CONFIRM POSTING BEFORE CREATING GRN IN SAP - @IAK
  confirmationPostToSAP() {
    const overallStatus = this.planProductionOrderFormGroup.get('samplesStatus')?.value;
    if (overallStatus === true) {
      const confirmation = this._qbsSuccessConfirmationService.open({
        title: ' Create Receipt From  Production',
        message: 'Do you want to post this document in SAP?',
        actions: {
          confirm: {
            label: 'Yes',
          },
          cancel: {
            label: 'No',
          },
        },
      });
      // subscribe afterClosed ACTION
      confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
          this.createGRN();
        }
      });
    }
  }
  backTolist() {
    this.router.navigate(['/evaluation-plan/list-of-evaluation-plan']);
  }
  // Function to generate barcode
  generateBarcode(value: string) {
    try {
      JsBarcode('#barcode', value, {
        format: 'CODE128', // CAN CHANGE THE FORMAT (e.g., EAN13, UPC, etc.)
        lineColor: '#000',
        width: 2,
        height: 100,
        displayValue: true,
      });
    } catch (error) {
      console.error('Error generating barcode:', error);
      this._snackBar.open('Invalid barcode value', 'Close', { duration: 3000 });
    }
  }
  showBarcodeSection = false;
  onGenerateTagClick() {
    const id = this.planProductionOrderFormGroup.get('id')?.value;
    this.showBarcodeSection = true;
    this.generateTag(id);
  }
  generateTag(id: string) {
    const productionQcId = id;
    const productionQcIdForBMR = id;
    let batchNoBC: string; 
    // CALLING getProductionQcBMRByQcId TO GET BMR BATCH NO
    this._evaluationProductionOrderService.getProductionQcBMRByQcId(productionQcIdForBMR).subscribe({
      next: (bmr: string) => {
        batchNoBC = bmr; 
        if (batchNoBC) {
          this.planProductionOrderFormGroup.get('barcodeValue').setValue(batchNoBC);
        }
      },
      error: (err) => {
        console.error('Error fetching BMR:', err);
      }
    });
  }
  // VALIDATE inspectionQuantity - @IAK
  isInspectionQuantityInvalid: boolean = false;
  onInspectionQuantityBlur(): void {
    const openQuantity: number = Number(this.planProductionOrderFormGroup.value.openQuantity);
    const inspectionQuantity: number = Number(this.planProductionOrderFormGroup.value.inspectionQuantity);
    const receiptQuantity: number = Number(this.planProductionOrderFormGroup.value.receiptQuantity);
    if (inspectionQuantity > openQuantity) {
      this.isInspectionQuantityInvalid = true;
      const errorMessage = `Inspection Qty can't be greater than Open Quantity ${openQuantity}.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.planProductionOrderFormGroup.patchValue({ inspectionQuantity: 0 });
    } else if (inspectionQuantity > receiptQuantity ) {
      this.isInspectionQuantityInvalid = true;
      const errorMessage = `Inspection Qty can't be greater than Receipt Quantity ${receiptQuantity}.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.planProductionOrderFormGroup.patchValue({ inspectionQuantity: 0 });
    } else if (inspectionQuantity < 1 ) {
      this.isInspectionQuantityInvalid = true;
      const errorMessage = `Inspection Qty can't be 0.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    } else {
      this.isInspectionQuantityInvalid = false;
    }
  }
  // VALIDATE receiptQuantity - @IAK
  isReceiptQuantityInvalid: boolean = false;
  onReceiptQuantityBlur(): void {
    const receiptQuantity: number = Number(this.planProductionOrderFormGroup.value.receiptQuantity);
    const openQuantity: number = Number(this.planProductionOrderFormGroup.value.openQuantity);
    if (receiptQuantity > openQuantity) {
      this.isReceiptQuantityInvalid = true;
      const errorMessage = `Receipt Qty can't be greater than Open Quantity ${openQuantity}.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.planProductionOrderFormGroup.patchValue({ receiptQuantity: 0 });
    } else if (receiptQuantity < 1) {
      this.isReceiptQuantityInvalid = true;
      const errorMessage = `Receipt Qty can't be 0.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    } else {
      this.isReceiptQuantityInvalid = false;
    }
  }
  // VALIDATE analyzedBy - @IAK
  isAnalyzedByInvalid: boolean = false;
  onAnalyzedByBlur(): void {
    const analyzedBy = this.planProductionOrderFormGroup.value.analyzedBy;
    if (analyzedBy.trim() === "") {
      this.isAnalyzedByInvalid = true;
      const errorMessage = `Analyzed By is mandatory and can't be empty.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.planProductionOrderFormGroup.patchValue({ analyzedBy: '' });
    } else {
      this.isAnalyzedByInvalid = false;
    }
  }
  // VALIDATE operatedBy - @IAK
  isOperatedByInvalid: boolean = false;
  onOperatedByBlur(): void {
    const analyzedBy = this.planProductionOrderFormGroup.value.operatedBy;
    if (analyzedBy.trim() === "") {
      this.isOperatedByInvalid = true;
      const errorMessage = `Operated By is mandatory and can't be empty.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.planProductionOrderFormGroup.patchValue({ operatedBy: '' });
    } else {
      this.isOperatedByInvalid = false;
    }
  }
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    // Format: DD/MM/YYYY
    return date.toLocaleDateString('en-GB');
  }
  isPlanProductionOrderFormValid: boolean = false;
  isPlanProductionOrderFormGroupValid(): void {
    const receiptQuantityValid = this.planProductionOrderFormGroup.get('receiptQuantity')?.valid;
    const inspectionQuantityValid = this.planProductionOrderFormGroup.get('inspectionQuantity')?.valid;
    const analyzedByValid = this.planProductionOrderFormGroup.get('analyzedBy')?.valid;
    console.log('receiptQuantity:', receiptQuantityValid);
    console.log('inspectionQuantity:', inspectionQuantityValid);
    console.log('analyzedBy:', analyzedByValid);
    this.isPlanProductionOrderFormValid =
      !!(receiptQuantityValid && inspectionQuantityValid && analyzedByValid);
  }
    formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months start from 0
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12
  const hourStr = String(hours).padStart(2, '0');

  return `${day}/${month}/${year} ${hourStr}:${minutes} ${ampm}`;
}
}