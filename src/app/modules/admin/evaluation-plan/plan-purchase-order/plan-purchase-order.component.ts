import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvaluationPlanPurchaseOrderService } from 'app/core/other-core-services/module/evaluation-plan-purchase-order.service';
import { SapPlanPurchaseOrderService } from '../../../../core/other-core-services/module/sap-plan-purchase-order.service';
import { MatDialogRef } from '@angular/material/dialog';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { SAPItemsService } from 'app/core/other-core-services/module/sap-list-all-items.service';
import { SAPAllServices } from 'app/core/other-core-services/module/sap-list-all-services.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QbsSuccessConfirmationService } from '@qbs/services/confirmation/success-confirmation.service';

@Component({
  selector: 'app-plan-purchase-order',
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
  ],
  templateUrl: './plan-purchase-order.component.html',
  styleUrls: ['./plan-purchase-order.component.scss']
})
export class PlanPurchaseOrderComponent implements AfterViewInit, OnInit {
  samplesStatus: boolean | null = null;
  selectedOrder: any;
  isFormSaved = false;
  isEditForm: boolean = false;
  isDropdownOpen = false;
  isValidate = false;
  isEditMode: boolean = false; // Default false, will be true if in Edit QC mode
  qcSampleID: string | null = null;   //  qcSampleID: string = '';
  cardCode: any;
  purchaseQcId: any
  selectedSampleId: any;
  addMode: boolean = false;  // Indicate a new sample is being added
  editMode: boolean = false;
  dataSourceQualitativeInspection: MatTableDataSource<any>;
  dataSourceQuantitativeInspection: MatTableDataSource<any>;
  dataSourceUoMIIC: MatTableDataSource<any>;
  dataSourceAddQuantitativeIIC: MatTableDataSource<any>;
  purchaseQcSamples: any
  selectedRowIndexUoM: number = -1;
  selectedUoMCode: string = '';
  purchaseQCSampleId: any
  displayedColumnsQualitative: string[] = ['inspectionCharacteristicName', 'inspectionCharacteristicSingleCriteria', 'isMandatory', 'qualitativeResultId', 'remarks'];
  displayedColumnsQuantitative: string[] = ['inspectionCharacteristicName', 'uoMCode', 'isMandatory', 'target', 'max', 'min', 'quantitativeResult', 'remarks'];
  displayedColumnsUoMIIC: string[] = ['code', 'description'];
  displayedColumnsAddQuantitativeIIC: string[] = ['inspectionCode', 'inspectionDescription'];
  currentMode: 'add' | 'edit' = 'add';

  uomData = [
    { id: 1, uoMCode: 'KG', description: 'Kilogram', isSelected: false },
    { id: 2, uoMCode: 'GM', description: 'Gram', isSelected: false },
    { id: 3, uoMCode: 'LTR', description: 'Liter', isSelected: false },
    { id: 4, uoMCode: 'ML', description: 'Milliliter', isSelected: false },
    { id: 5, uoMCode: 'CM', description: 'Centimeter', isSelected: false }
  ];

  quantitativeCharacteristics = [
    { id: 1, intCode: 'WT001', description: 'Weight Check', isSelected: false },
    { id: 2, intCode: 'DM001', description: 'Dimension Check', isSelected: false },
    { id: 3, intCode: 'TH001', description: 'Thickness Check', isSelected: false },
    { id: 4, intCode: 'PH001', description: 'pH Level', isSelected: false },
    { id: 5, intCode: 'VS001', description: 'Viscosity', isSelected: false }
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _evaluationPurchaseOrderService: EvaluationPlanPurchaseOrderService,
    private _sapPlanPurchaseOrderService: SapPlanPurchaseOrderService,
    private router: Router,
    private _activeRoute: ActivatedRoute,
    private _qbsConfirmationService: QbsConfirmationService,
    private _SAPItemsService: SAPItemsService,
    private _SAPAllServices: SAPAllServices,
    private _qbsSuccessConfirmationService: QbsSuccessConfirmationService,
  ) { }

  planPurchaseOrderFormGroup = this._formBuilder.group({
    id: [''], // ✅ Empty string if null not allowed
    intCode: [""], // number
    docNo: [], // number
    openQuantity: [], // number
    status: [''], // ✅ Meaningful status
    documentType: [''], // ✅ Meaningful type
    documentDate: [new Date().toISOString()], // ✅ Correct ISO format
    lineNo: [], // ✅ Keep null if API supports
    receiveQuantity: [], // number
    inspectionQuantity: [], // number
    inspectionDateTime: [new Date().toISOString()], // ✅ Correct ISO format
    qcLotNo: [], // number
    docDate: [new Date().toISOString()], // ✅ Correct ISO format
    analyzedBy: [''], // string
    poCode: [], // string
    warehouse: [''], // string
    sapQuantity: [], // number
    sampleQuantity: [], // number
    vendor: [''], // string
    remarks: [''], // string
    itemId: null, // ✅ Empty string instead of null
    itemCode: [''],
    itemDescription: [''],
    itemCodeModalPO: ['ITEM-123'],
    inspectionQtyModalPO: ['50'],
    inspectionByModalPO: ['Mr. Kamran'],
    inspectionTimeModalPO: ['10:30 AM'],
    receiveQtyPO: ['Item'],
    qualitativeInspectionObjects: this.fb.array([]),
    quantitativeInspectionResults: this.fb.array([]),
    inspectionBy: [''],
    qcId: [''],
    result: [0],
    inspectionObjects: this.fb.array([this.createInspectionObject()]),
    sampleName: [''],
    isFlexible: [false],
    samplesStatus: [false],
    isPerformed: [true],
    isPostedToSap: [false],
    isClosed: [false],
    overallStatus: [false],
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
    return this.planPurchaseOrderFormGroup.get('inspectionObjects') as FormArray;
  }

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
    return Number(this.planPurchaseOrderFormGroup.get('sampleQuantity')?.value) || 0;
  }

  get qualitativeInspectionObjects(): FormArray {
    return this.planPurchaseOrderFormGroup.get('qualitativeInspectionObjects') as FormArray;
  }

  get quantitativeInspectionResults(): FormArray {
    return this.planPurchaseOrderFormGroup.get('quantitativeInspectionResults') as FormArray;
  }



  onSubmitPurchaseOrderX(): void {
    this.isValidate = true;
    if (this.planPurchaseOrderFormGroup.valid) {

      const inspectionQuantity: number = Number(this.planPurchaseOrderFormGroup.value.inspectionQuantity);
      const itemId: string = String(this.planPurchaseOrderFormGroup.value.itemId);
      const openQuantity: number = Number(this.planPurchaseOrderFormGroup.value.openQuantity);
      if (inspectionQuantity > openQuantity) {
        const errorMessage = `Inspection Qty can't be greater than Open Quantity (${openQuantity})`;
        this._snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        this.isValidate = false;
        this.isFormSaved = false;
        return;
      }

      console.log('PAYLOAD BEFORE GET sampleQuantity API:', this.planPurchaseOrderFormGroup.valid);

      this.getSampleQuantity(inspectionQuantity, itemId).then(() => {

        const formData = this.planPurchaseOrderFormGroup.value;
        if (formData) {
          formData.qcLotNo = String(formData.qcLotNo);
          formData.receiveQuantity = String(formData.receiveQuantity);
          formData.inspectionQuantity = String(formData.inspectionQuantity);
        }
        console.log('UPDATED FORM DATA AFTER SAMPLE QTY:', formData);

        const { id, documentType, inspectionByModalPO, inspectionQtyModalPO, inspectionTimeModalPO, intCode, itemCode, itemCodeModalPO, itemDescription, poCode, receiveQtyPO,
          ...payload } = formData;

        console.log('SENDING PURCHASE ORDER PAYLOAD:', payload);

        this.isFormSaved = true; // UI trigger karega
        // return;
        this._evaluationPurchaseOrderService.AddPurchaseOrder(payload).subscribe(
          (response) => {
            if (response.isRequestSuccess) {
              console.log('API RUN SUCCESSFULLY.', payload);
              this._snackBar.open('Purchase Order added successfully!', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-success']
              });
            }
          },
          (error) => {
            this._snackBar.open('Error adding purchase order.', 'Close', {
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

  onSubmitPurchaseOrder(): void {
    this.isValidate = true;

    if (this.planPurchaseOrderFormGroup.valid) {
      const inspectionQuantity: number = Number(this.planPurchaseOrderFormGroup.value.inspectionQuantity);
      const receiveQuantity: number = Number(this.planPurchaseOrderFormGroup.value.receiveQuantity);
      const qcLotNo  = this.planPurchaseOrderFormGroup.value.qcLotNo;
      const itemId: string = String(this.planPurchaseOrderFormGroup.value.itemId);
      const openQuantity: number = Number(this.planPurchaseOrderFormGroup.value.openQuantity);

      if (inspectionQuantity > openQuantity) {
        const errorMessage = `Inspection Qty can't be greater than Open Quantity (${openQuantity})`;
        this._snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        this.isValidate = false;
        this.isFormSaved = false;
        return;
      }
      else if (receiveQuantity > openQuantity) {
        const errorMessage = `Receive Qty can't be greater than Open Quantity (${openQuantity})`;
        this._snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        this.isValidate = false;
        this.isFormSaved = false;
        return;
      }
      else if (receiveQuantity < 1 || inspectionQuantity < 1) {
        const errorMessage = `Quantity can't be 0`;
        this._snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
        this.isValidate = false;
        this.isFormSaved = false;
        return;
      }

      console.log('PAYLOAD BEFORE GET sampleQuantity API:', this.planPurchaseOrderFormGroup.valid);
  
      this.getSampleQuantity(inspectionQuantity, itemId).then(() => {
        const formData = this.planPurchaseOrderFormGroup.value;
  
        if (formData) {
          formData.qcLotNo = String(formData.qcLotNo);
          formData.receiveQuantity = String(formData.receiveQuantity);
          formData.inspectionQuantity = String(formData.inspectionQuantity);
        }
  
        console.log('UPDATED FORM DATA AFTER SAMPLE QTY:', formData);
  
        const {
          id, documentType, inspectionByModalPO, inspectionQtyModalPO, inspectionTimeModalPO,
          intCode, itemCode, itemCodeModalPO, itemDescription, poCode, receiveQtyPO,
          ...payload
        } = formData;
  
        console.log('SENDING PURCHASE ORDER PAYLOAD:', payload);
  
        this._evaluationPurchaseOrderService
          .getQualityStatusQC('purchase_qc', formData.itemCode, formData.docNo, formData.lineNo)
          .subscribe({
            next: (qualityResponse) => {
              if (qualityResponse?.data?.isClosed === false) {
                // QC is already open
                this._snackBar.open('QC already open for this item. Cannot submit again.', 'Close', {
                  duration: 3000,
                  panelClass: ['snackbar-error']
                });
                this.isFormSaved = false;
                return;
              }
  
              // ✅ Safe to proceed
              this.isFormSaved = true;
  
              this._evaluationPurchaseOrderService.AddPurchaseOrder(payload).subscribe(
                (response) => {
                  if (response.isRequestSuccess) {
                    console.log('API RUN SUCCESSFULLY.', payload);
                    this._snackBar.open('Purchase Order added successfully!', 'Close', {
                      duration: 3000,
                      panelClass: ['snackbar-success']
                    });
                  }
                },
                (error) => {
                  this._snackBar.open('Error adding purchase order.', 'Close', {
                    duration: 3000,
                    panelClass: ['snackbar-error']
                  });
                }
              );
            },
            error: (error) => {
              console.error('Error calling QC API:', error);
              this._snackBar.open('Failed to verify QC status.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
              });
            }
          });
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
  
  // GET API CALL TO UPDATE sampleQuantity
  getSampleQuantity(inspectionQuantity: number, itemId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._evaluationPurchaseOrderService.getSampleQuantityRange(inspectionQuantity, itemId).subscribe(
        (response) => {
          if (response.isRequestSuccess && response.data !== 0) {
            this.planPurchaseOrderFormGroup.get('sampleQuantity')?.setValue(response.data);
            this._snackBar.open('Sample Qty fetched successfully!', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
          } else if (response.isRequestSuccess && response.data === 0) {
            this.isValidate = false;
            this.isFormSaved = false;
            this._snackBar.open('Failed to get Sample Qty. Please enter a valid inspection Qty.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
            return;
          } else {
            this.isValidate = false;
            this.isFormSaved = false;
            this._snackBar.open('Failed to fetched Sample Qty.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
            return;
          }
          resolve(); // Make sure to resolve the promise
        },
        (error) => {
          this._snackBar.open('Error adding purchase order.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
          reject(error); // Reject the promise on error
        }
      );
    });
  }


  cancelForm() {
    this.planPurchaseOrderFormGroup.reset();
  }

  samplesPurchaseOrder = [];
  nextSampleId: number = 1;

  getPurchaseByQcCodeX(itemCode: string, docNo: number, lineNum: number) {
    this._sapPlanPurchaseOrderService.GetPurchaseQCId(itemCode, docNo, lineNum).subscribe({
      next: (response) => {

        this.purchaseQcId = response.data;

        this.addNewSampleForPurchaseOrder()
      },
      error: (err) => {
        console.error('QC SERVICE ERROR:', err);
      }
    });
  }

  getPurchaseByQcCode(itemCode: string, docNo: number, lineNum: number) {
    this._sapPlanPurchaseOrderService.GetPurchaseQCId(itemCode, docNo, lineNum).subscribe({
      next: (response) => {
        this.purchaseQcId = response.data;
        this.planPurchaseOrderFormGroup.patchValue({
          // inspectionBy: response.inspectionBy || '', 
          inspectionDateTime: response.inspectionDateTime || new Date().toISOString(),
          id: response?.data?.id || '', // Safely patch QCId, fallback to empty if null
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('QC SERVICE ERROR:', err);
      }
    });
  }

  // getPurchaseByQcSampleId(purchaseQCSampleId: string) {
  //   this._sapPlanPurchaseOrderService.getPurchaseQcSampleById(purchaseQCSampleId).subscribe({
  //     next: (response) => {
  //       this.purchaseQCSampleId = response.data;
  //       console.log(this.purchaseQCSampleId, 'this.purchaseQCSampleId');

  //       },
  //       error: (err) => {
  //         console.error('QC SERVICE ERROR:', err);
  //         }
  //   })
  // }

  handleSamplePurchaseOrder() {
    if (this.isEditMode) {
      this.updateSampleForPurchaseOrder()
    } else {
      this.addNewSampleForPurchaseOrder()
    }
  }

  updateSampleForPurchaseOrder(): void {
    if (!this.planPurchaseOrderFormGroup.valid) {
      console.error("FORM IS INVALID");
      this.planPurchaseOrderFormGroup.markAllAsTouched();
      return;
    }

    if (!this.purchaseQcId || !this.qcSampleID) {
      console.error('QC ID OR SAMPLE ID IS MISSING, CANNOT PROCEED!', { purchaseQcId: this.purchaseQcId, qcSampleID: this.qcSampleID });
      return;
    }

    const formValue = this.planPurchaseOrderFormGroup.value;

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
        remarks: item?.remarks || ""
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
        quantitativeResult: resultValue,
        isQuantitativeResultPassed: item?.result !== undefined &&
          !isNaN(resultValue) &&
          resultValue >= (item.min ?? 0) &&
          resultValue <= (item.max ?? 0),
        remarks: item?.remarks || ""
      };
    }) || [];

    // STEP 3: COMBINE INSPECTIONS
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

    // STEP 4: CREATE FINAL PAYLOAD
    const updatedSamplePayload = {
      id: this.qcSampleID,
      name: formValue.sampleName,
      inspectionDateTime: formValue.inspectionDateTime || new Date().toISOString(),
      inspectionBy: formValue.inspectionBy || "",
      qcId: this.purchaseQcId.id,
      isSamplePassed: isSamplePassed,
      inspectionObjects: inspectionObjects
    };

    // STEP 5: API CALL
    this._sapPlanPurchaseOrderService.UpdatePurchaseQcSample(updatedSamplePayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        const addedSampleStatus = isSamplePassed ? 'Passed' : 'Failed';
        this._snackBar.open(`Sample updated successfully with status ${addedSampleStatus}`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });

        // API CALL TO FETCH isSamplePassed - @IAK
        this._evaluationPurchaseOrderService.getIsSamplePassedListByQcId(this.purchaseQcId.id).subscribe({
          next: (isSamplePassedList: boolean[]) => {
            console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);

            this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
            console.log('samplesStatus:', this.samplesStatus);

            this.planPurchaseOrderFormGroup.patchValue({
              samplesStatus: this.samplesStatus
            });
            this.cdr.detectChanges();
            this.ListAllPurchaseQCSamplesByQcId(this.selectedOrder.id)
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
        const existingSampleIndex = this.purchaseQcSamples.findIndex(sample => sample.id === this.qcSampleID);
        if (existingSampleIndex !== -1) {
          this.purchaseQcSamples[existingSampleIndex] = {
            ...this.purchaseQcSamples[existingSampleIndex],
            inspectionDateTime: formValue.inspectionDateTime,
            inspectionBy: formValue.inspectionBy
          };
          this.purchaseQcSamples = [...this.purchaseQcSamples];
          this.selectedSampleId = this.qcSampleID;
        }

        this.ListAllPurchaseQCSamplesByQcId(this.purchaseQcId.id);
        this.closeDialog();
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });
  }
  XupdateSampleForPurchaseOrder(): void {
    if (!this.planPurchaseOrderFormGroup.valid) {
      console.error("FORM IS INVALID");
      console.log("FORM ERRORS:", this.planPurchaseOrderFormGroup.errors);
      console.log("FORM VALUE:", this.planPurchaseOrderFormGroup.value);
      console.log("INSPECTION BY ERRORS:", this.planPurchaseOrderFormGroup.get('inspectionBy')?.errors);
      console.log("INSPECTION DATETIME ERRORS:", this.planPurchaseOrderFormGroup.get('inspectionDateTime')?.errors);
      this.planPurchaseOrderFormGroup.markAllAsTouched();
      return;
    }

    if (!this.purchaseQcId || !this.qcSampleID) {
      console.error('QC ID OR SAMPLE ID IS MISSING, CANNOT PROCEED!', { purchaseQcId: this.purchaseQcId, qcSampleID: this.qcSampleID });
      return;
    }

    const formValue = this.planPurchaseOrderFormGroup.value;

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
        remarks: item?.remarks || ""
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
        remarks: item?.remarks || ""
      };
    }) || [];

    // STEP 3: COMBINE QUALITATIVE AND QUANTITATIVE INSPECTIONS
    const inspectionObjects = [...qualitativeInspections, ...quantitativeInspections];

    const isSamplePassed = inspectionObjects.some((inspection: any) => inspection.isQuantitativeResultPassed === true);
    // STEP 4: CREATING THE FINAL PAYLOAD
    const updatedSamplePayload = {
      id: this.qcSampleID,
      name: formValue.sampleName,
      inspectionDateTime: formValue.inspectionDateTime || new Date().toISOString(),
      inspectionBy: formValue.inspectionBy || "",
      qcId: this.purchaseQcId.id,
      isSamplePassed: isSamplePassed,
      inspectionObjects: inspectionObjects
    };

    console.log('FINAL PAYLOAD:', updatedSamplePayload);
    // return;
    // STEP 5: CALLING THE UPDATE API
    this._sapPlanPurchaseOrderService.UpdatePurchaseQcSample(updatedSamplePayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        const existingSampleIndex = this.purchaseQcSamples.findIndex(sample => sample.id === this.qcSampleID);

        if (existingSampleIndex !== -1) {
          // Update only the specific sample details
          this.purchaseQcSamples[existingSampleIndex] = {
            ...this.purchaseQcSamples[existingSampleIndex],
            inspectionDateTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime')?.value,
            inspectionBy: this.planPurchaseOrderFormGroup.get('inspectionBy')?.value
          };
          this.purchaseQcSamples = [...this.purchaseQcSamples];

          // Keep the selected card after update
          this.selectedSampleId = this.qcSampleID;
        } else {
          console.error(`Sample with ID ${this.qcSampleID} not found in purchaseQcSamples`);
        }

        // Instead of reloading the full list, just update the form fields
        this.planPurchaseOrderFormGroup.patchValue({
          inspectionDateTime: this.purchaseQcSamples[existingSampleIndex]?.inspectionDateTime,
          inspectionBy: this.purchaseQcSamples[existingSampleIndex]?.inspectionBy
        });

        // Refresh the samples list
        // this.ListAllPurchaseQCSamplesByQcId(this.purchaseQcId.id);
        const isNewSample = !this.purchaseQcSamples.some(sample => sample.id === this.qcSampleID);

        if (isNewSample) {
          const newSample = {
            id: this.nextSampleId,
            inspectionTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime').value,
            inspectionBy: this.planPurchaseOrderFormGroup.get('inspectionBy').value,
            cardColor: quantitativeInspections.some(item => item.isQuantitativeResultPassed) ? 'lightgreen' : 'lightcoral'  // cardColor: this.getRandomCardColor()
          };

          this.samplesPurchaseOrder.push(newSample);
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

  addNewSampleForPurchaseOrder(): void {
    if (!this.planPurchaseOrderFormGroup.valid) {
      console.error("FORM IS INVALID");
      console.log("FORM ERRORS:", this.planPurchaseOrderFormGroup.errors);
      console.log("FORM VALUE:", this.planPurchaseOrderFormGroup.value);
      this.planPurchaseOrderFormGroup.markAllAsTouched();
      return;
    }

    if (!this.purchaseQcId) {
      console.error('QC ID IS MISSING, CANNOT PROCEED!');
      return;
    }

    const formValue = this.planPurchaseOrderFormGroup.value;

    // Log form values for debugging
    console.log("Qualitative Inspection Objects:", this.qualitativeInspectionObjects.value);

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
        remarks: item?.remarks || ""
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
        remarks: item?.remarks || ""
      };
    }) || [];

    // STEP 3: COMBINE BOTH TYPES
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
    // STEP 4: CREATING THE FINAL PAYLOAD
    const newSamplePayload = {
      name: `sample-${this.nextSampleId}`,
      inspectionDateTime: new Date().toISOString(),
      inspectionBy: formValue.inspectionBy || "",
      qcId: this.purchaseQcId.id,
      isSamplePassed: isSamplePassed,
      inspectionObjects: inspectionObjects
    };

    console.log('FINAL PAYLOAD:', newSamplePayload);
    // return;
    // STEP 5: API CALL
    this._sapPlanPurchaseOrderService.addPurchaseQcSample(newSamplePayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);

        const addedSampleStatus = isSamplePassed ? 'Passed' : 'Failed';
        this._snackBar.open(`Sample added successfully with status ${addedSampleStatus}`, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });

        // API CALL TO FETCH isSamplePassed - @IAK
        this._evaluationPurchaseOrderService.getIsSamplePassedListByQcId(this.purchaseQcId.id).subscribe({
          next: (isSamplePassedList: boolean[]) => {
            console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);

            this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
            console.log('SAMPLES STATUS ~ this.samplesStatus:', this.samplesStatus);

            this.planPurchaseOrderFormGroup.patchValue({
              samplesStatus: this.samplesStatus
            });
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('getIsSamplePassedListByQcId API Error:', error);
            this._snackBar.open('Failed to fetch samples against this Purchase Order.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });

        const existingSampleIndex = this.purchaseQcSamples.findIndex(sample => sample.id === this.qcSampleID);

        if (existingSampleIndex !== -1) {
          this.purchaseQcSamples[existingSampleIndex] = {
            ...this.purchaseQcSamples[existingSampleIndex],
            inspectionDateTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime')?.value,
            inspectionBy: this.planPurchaseOrderFormGroup.get('inspectionBy')?.value
          };
          this.purchaseQcSamples = [...this.purchaseQcSamples];
          this.selectedSampleId = this.qcSampleID;
        } else {
          console.error(`Sample with ID ${this.qcSampleID} not found in purchaseQcSamples`);
        }

        this.planPurchaseOrderFormGroup.patchValue({
          inspectionDateTime: this.purchaseQcSamples[existingSampleIndex]?.inspectionDateTime,
          inspectionBy: this.purchaseQcSamples[existingSampleIndex]?.inspectionBy
        });

        this.ListAllPurchaseQCSamplesByQcId(this.purchaseQcId.id);

        const isNewSample = !this.purchaseQcSamples.some(sample => sample.id === this.qcSampleID);
        if (isNewSample) {
          const newSample = {
            id: this.nextSampleId,
            inspectionTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime').value,
            inspectionBy: this.planPurchaseOrderFormGroup.get('inspectionBy').value,
            // cardColor: quantitativeInspections.some(item => item.isQuantitativeResultPassed) ? 'lightgreen' : 'lightcoral'  //  cardColor: this.getRandomCardColor()
            cardColor: isSamplePassed ? 'lightgreen' : 'lightcoral'
          };
          this.samplesPurchaseOrder.push(newSample);
          this.nextSampleId++;
        }

        this.closeDialog();
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });

    // ✅ STEP 6: Reset form for next sample
    // this.planPurchaseOrderFormGroup.reset();
    this.qualitativeInspectionObjects.clear();
    this.quantitativeInspectionResults.clear();

    // STEP 7: Setup new form state if needed
    const newSample = {
      id: this.nextSampleId,
      inspectionTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime').value,
      inspectionBy: this.planPurchaseOrderFormGroup.get('inspectionBy').value,
      // cardColor: quantitativeInspections.some(item => item.isQuantitativeResultPassed) ? 'lightgreen' : 'lightcoral'  //  cardColor: this.getRandomCardColor()
      cardColor: isSamplePassed ? 'lightgreen' : 'lightcoral'
    };
    console.log("Sample Card Color:", newSample.cardColor);
    this.samplesPurchaseOrder.push(newSample);
    this.nextSampleId++;

    this.closeDialog();
  }


  getRandomCardColor(): string {
    const colors = ['#e8f5e9', '#ffebee', '#f5f5f5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  @ViewChild('dialogTemplateItems') dialogTemplateItems;
  @ViewChild('EditdialogTemplateItems') EditdialogTemplateItems;


  ngOnInit() {
    this.planPurchaseOrderFormGroup.valueChanges.subscribe(() => {
      this.isPlanPurchaseOrderFormGroupValid();
    });


    this.selectedOrder = history.state.selectedOrder;
    this.isEditMode = history.state.from === 'evaluationPlan'; // Set edit mode if coming from Edit QC

    if (this.selectedOrder) {
      if (this.isEditMode) {
        this.planPurchaseOrderFormGroup.patchValue({ id: this.selectedOrder.id });
        this.populateEditForm(this.selectedOrder); // Call Edit QC function
        this.ListAllPurchaseQCSamplesByQcId(this.selectedOrder.id)
        // API CALL TO FETCH isSamplePassed - @IAK
        this._evaluationPurchaseOrderService.getIsSamplePassedListByQcId(this.selectedOrder.id).subscribe({
          next: (isSamplePassedList: boolean[]) => {
            console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);

            // this.samplesStatus = isSamplePassedList.some(status => status === true);
            this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
            console.log('SAMPLES STATUS ~ this.samplesStatus:', this.samplesStatus);

            this.planPurchaseOrderFormGroup.patchValue({
              samplesStatus: this.samplesStatus
            });
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('getIsSamplePassedListByQcId API Error:', error);
            this._snackBar.open('No sample has been created for this Purchase Order yet', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
        console.log('HAHA', this.selectedOrder)
      } else {
        this.populateForm(this.selectedOrder); // Call Perform QC function
      }
      this.getItemId(this.selectedOrder.itemCode);
    }
    if (!this.isEditMode) {
      this._evaluationPurchaseOrderService.getPurchaseQCCode().subscribe((purchaseQCCode) => {
        console.log('Purchase QC Code:', purchaseQCCode); // Debugging ke liye

        const fullCode = `PQC-000${purchaseQCCode.data || ''}`; // Code format
        this.planPurchaseOrderFormGroup.get('intCode')?.setValue(fullCode); // Yahan correct form group use karo
      });
    }



    this.dataSourceQualitativeInspection = new MatTableDataSource(this.qualitativeInspectionObjects.controls);
    this.dataSourceQuantitativeInspection = new MatTableDataSource(this.quantitativeInspectionResults.controls);
    this.dataSourceUoMIIC = new MatTableDataSource(this.uomData);
    this.dataSourceAddQuantitativeIIC = new MatTableDataSource(this.quantitativeCharacteristics);
  }

  populateForm(data: any): void {
    console.log('Perform QC - Selected Order:', data);
    this.planPurchaseOrderFormGroup.patchValue({
      // id: "", // Add missing field
      // intCode: "", // Add missing field
      docNo: data.docNo.toString(), // Convert to string
      openQuantity: data.openQty,
      status: data.status, // Add missing field
      documentType: "", // Add missing field
      documentDate: new Date().toISOString(), // Add missing field
      lineNo: data.lineNum, // Add missing field
      analyzedBy: data.analyzedBy,
      // receiveQuantity: 0, // Add missing field
      // inspectionQuantity: 0, // Add missing field
      inspectionDateTime: new Date().toISOString(), // Add missing field
      // qcLotNo: 0, // Add missing field
      docDate: data.docDate,
      poCode: data.docNo.toString(), // Convert to string
      warehouse: data.warehouse,
      sapQuantity: data.qty,
      // sampleQuantity: 3, // Add missing field
      vendor: data.cardName,
      remarks: "",
      itemDescription: data.itemDescription,
      itemCode: data.itemCode,

    });
  }

  populateEditForm(data: any): void {
    console.log('Populating Edit QC Form:', data);
    // FORMATTING intCode
    const rowIntCode = data.intCode ?? '';
    const formattedIntCode = `PQC-${rowIntCode.toString().padStart(7, '0')}`;
    this.planPurchaseOrderFormGroup.patchValue({
      intCode: formattedIntCode ?? "",  // intCode: data.intCode ?? "",  
      itemCode: data.itemCode ?? "",
      itemDescription: data.itemDescription ?? "",
      openQuantity: data.openQuantity ?? 0,
      analyzedBy: data.analyzedBy,
      status: data.status ?? "",
      documentType: data.docType ?? "",
      documentDate: data.docDate ? new Date(data.docDate).toISOString() : new Date().toISOString(),
      lineNo: data.lineNum ?? 0,
      receiveQuantity: data.receiveQuantity ?? 0,
      inspectionQuantity: data.inspectionQuantity ?? 0,
      inspectionDateTime: data.inspectionDateTime ? new Date(data.inspectionDateTime).toISOString() : new Date().toISOString(),
      qcLotNo: data.qcLotNo ?? "",
      docDate: data.docDate ?? "",
      docNo: data.docNo ?? "",
      warehouse: data.warehouse ?? "",
      sapQuantity: data.sapQuantity ?? 0,
      sampleQuantity: data.sampleQuantity ?? 0,
      vendor: data.vendor ?? "",
      remarks: data.remarks ?? "",
      itemId: data.itemDetails?.id ?? "",
      // id: data.id,
      isClosed: data.isClosed === true ? true : false,
    });
  }


  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  xonEditSample(sample: any): void {
    alert("this is the function");
    const dialogRef = this.dialog.open(this.dialogTemplateItems, {
      width: '70%',
      height: '75vh',
      data: this.cardCode
    });
    this.getCardByItemCode(this.selectedOrder.itemCode);
    console.log(this.selectedOrder, 'this.selectedOrder')
    this.getPurchaseByQcCode(
      this.selectedOrder.itemCode,
      this.selectedOrder.docNo,
      this.selectedOrder.lineNum
    )




    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        const index = this.samplesPurchaseOrder.findIndex(s => s.id === sample.id);
        if (index !== -1) {
          this.samplesPurchaseOrder[index] = result;
        }
      }
      console.log('EDIT DIALOG CLOSED');
    });
  }
  private dialogRef: MatDialogRef<any>;
  onEditSample(sample: any): void {
    this.currentMode = 'edit';
    console.log('Sample Data:', sample);
    // alert('Sample ID: ' + (sample ? sample.id : 'undefined'));
    // alert('Sample : ' + (sample ? sample.name : 'undefined'));
    // alert('inspectionBy : ' + (sample ? sample.inspectionBy : 'undefined')); 

    if (!sample || !sample.id) {
      console.error('Sample or sample.id is undefined!');
      return;
    }

    // 🧼 Clear previous state before patching the new one
    this.qualitativeInspectionObjects.clear();
    this.quantitativeInspectionResults.clear();

    this.qcSampleID = sample.id;

    this.planPurchaseOrderFormGroup.patchValue({
      sampleName: sample.name || '',
    });

    const dialogRef = this.dialog.open(this.dialogTemplateItems, {
      width: '70%',
      height: '75vh',
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
    this.getPurchaseByQcCode(
      this.selectedOrder.itemCode,
      this.selectedOrder.docNo,
      this.selectedOrder.lineNum
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.samplesPurchaseOrder.findIndex(s => s.id === sample.id);
        if (index !== -1) {
          this.samplesPurchaseOrder[index] = result;
        }
      }
      console.log('EDIT DIALOG CLOSED');
    });
  }

  onPurchaseOrderModal(): void {
    this.currentMode = 'add';
    const dialogRef = this.dialog.open(this.dialogTemplateItems, {
      width: '70%',
      height: '75vh',
      data: this.cardCode,
    });
    // DYNAMICALLY ADD Validators.required TO inspectionBy
    const inspectionByControl = this.planPurchaseOrderFormGroup.get('inspectionBy');
    if (inspectionByControl) {
      inspectionByControl.setValidators(Validators.required);
      inspectionByControl.updateValueAndValidity(); // Re-validate the control
    }



    this.getCardByItemCode(this.selectedOrder.itemCode);
    console.log(this.selectedOrder, 'this.selectedOrder')
    this.getPurchaseByQcCode(
      this.selectedOrder.itemCode,
      this.selectedOrder.docNo,
      this.selectedOrder.lineNum
    )

    // IMMEDIATELY LOG FORM STATE
    console.log('Form Initial State (Immediate):', this.planPurchaseOrderFormGroup.value);
    console.log('Form Valid (Immediate):', this.planPurchaseOrderFormGroup.valid);
    console.log('Inspection By Errors (Immediate):', this.planPurchaseOrderFormGroup.get('inspectionBy')?.errors);
    // LOG AFTER 1 SECOND TO CHECK IF STATE CHANGES
    setTimeout(() => {
      console.log('Form Initial State (After 1s):', this.planPurchaseOrderFormGroup.value);
      console.log('Form Valid (After 1s):', this.planPurchaseOrderFormGroup.valid);
      console.log('Inspection By Errors (After 1s):', this.planPurchaseOrderFormGroup.get('inspectionBy')?.errors);
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

  onUpdatePurchaseOrderModal(): void {
    const dialogRef = this.dialog.open(this.dialogTemplateItems, {
      width: '70%',
      height: '75vh',
      data: this.cardCode,
    });
    // DYNAMICALLY ADD Validators.required TO inspectionBy
    const inspectionByControl = this.planPurchaseOrderFormGroup.get('inspectionBy');
    if (inspectionByControl) {
      inspectionByControl.setValidators(Validators.required);
      inspectionByControl.updateValueAndValidity(); // Re-validate the control
    }



    this.getCardByItemCode(this.selectedOrder.itemCode);
    console.log(this.selectedOrder, 'this.selectedOrder')
    this.getPurchaseByQcCode(
      this.selectedOrder.itemCode,
      this.selectedOrder.docNo,
      this.selectedOrder.lineNum
    )

    // IMMEDIATELY LOG FORM STATE
    console.log('Form Initial State (Immediate):', this.planPurchaseOrderFormGroup.value);
    console.log('Form Valid (Immediate):', this.planPurchaseOrderFormGroup.valid);
    console.log('Inspection By Errors (Immediate):', this.planPurchaseOrderFormGroup.get('inspectionBy')?.errors);
    // LOG AFTER 1 SECOND TO CHECK IF STATE CHANGES
    setTimeout(() => {
      console.log('Form Initial State (After 1s):', this.planPurchaseOrderFormGroup.value);
      console.log('Form Valid (After 1s):', this.planPurchaseOrderFormGroup.valid);
      console.log('Inspection By Errors (After 1s):', this.planPurchaseOrderFormGroup.get('inspectionBy')?.errors);
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


  closeDialog(): void {
    this.dialog.closeAll();
  }

  getCardByItemCode(itemCode: string) {
    this._sapPlanPurchaseOrderService.getItemCode(itemCode).subscribe({
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

  ListAllPurchaseQCSamplesByQcId(purchaseQcId: string) {
    this._sapPlanPurchaseOrderService.ListAllPurchaseQCSamplesByQcId(purchaseQcId).subscribe({
      next: (response) => {
        this.purchaseQcSamples = response.data.filter(sample => sample.isActive === true);
        console.log(this.purchaseQcSamples, 'purchaseQcSamples');
        console.log(this.purchaseQcSamples, 'purchaseQcSamples');

        if (this.purchaseQcSamples.length > 0) {
          this.qcSampleID = this.qcSampleID
            ? this.purchaseQcSamples.find(sample => sample.id === this.qcSampleID)?.id || this.purchaseQcSamples[this.purchaseQcSamples.length - 1].id
            : this.purchaseQcSamples[this.purchaseQcSamples.length - 1].id;
        }

      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      }
    })
  }




  populateQualitativeAndQuantitativeData(data: any) {
    const qualitativeArray = this.planPurchaseOrderFormGroup.get('qualitativeInspectionObjects') as FormArray;
    const quantitativeArray = this.planPurchaseOrderFormGroup.get('quantitativeInspectionResults') as FormArray;

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

  onRowChangeUoMIIC(row: any): void {
    this.uomData.forEach(item => item.isSelected = false);
    row.isSelected = true;
    this.selectedUoMCode = row.uoMCode;
  }

  addSelectedRowUoMIIC(index: number): void {
    const selectedUoM = this.uomData.find(item => item.isSelected);
    if (selectedUoM && index >= 0) {
      this.quantitativeInspectionResults.at(index).get('uoMId')?.setValue(selectedUoM.uoMCode);
    }
    this.closeDialog();
  }

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
          remarks: [''],

        })
      );

    }
    this.closeDialog();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  action1() {
    console.log("Action 1 selected");
  }

  getItemId(itemCode: any): void {
    this._evaluationPurchaseOrderService.GetItemIdByCode(itemCode).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0) {
          const itemId = response.data[0].id;
          this.planPurchaseOrderFormGroup.get('itemId')?.setValue(itemId);
          this.getItemFlexibility(itemId);
        }
      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      }
    });
  }
  getItemFlexibility(ItemId: any): void {
    this._evaluationPurchaseOrderService.getFlexibilityByItemId(ItemId).subscribe({
      next: (isFlexible: boolean) => {
        console.log('FLEXIBILITY:', isFlexible);
        if (isFlexible) {
          this.planPurchaseOrderFormGroup.get('isFlexible')?.setValue(isFlexible);
        } else {
          console.log('FLEXIBILITY:', isFlexible);
        }
      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      }
    });
  }
  // CLOSE OPEN QC FORCEFULLY - @IAK
  closeOpenQC() {
    const OpenPOqcId = this.planPurchaseOrderFormGroup.get('id')?.value;
    if (!OpenPOqcId) {
      console.error('NO VALID PURCHASE QC ID FOUND AGAINST THIS PO');
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
      overallStatus: this.planPurchaseOrderFormGroup.get('samplesStatus')?.value,
      id: OpenPOqcId,
      inspectionDateTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime')?.value,
      remarks: this.planPurchaseOrderFormGroup.get('remarks')?.value || 'Closed due to unknown reasons',
      isActive: true,
    };
    console.log('PAYLOAD', payloadToCloseOpenQC);
    // FUNCTION TO HANDLE API CALL
    const callCloseQCApi = () => {
      this._evaluationPurchaseOrderService.updateToCloseOpenQC(payloadToCloseOpenQC).subscribe({
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
  // VALIDATE INSPECTION QTY WITH SAP QTY - @IAK
  isInspectionQuantityInvalid: boolean = false;
  onInspectionQuantityBlur(): void {
    const openQuantity: number = Number(this.planPurchaseOrderFormGroup.value.openQuantity);
    const inspectionQuantity: number = Number(this.planPurchaseOrderFormGroup.value.inspectionQuantity);
    if (inspectionQuantity > openQuantity) {
      this.isInspectionQuantityInvalid = true;
      const errorMessage = `Inspection Qty can't be greater than Open Quantity ${openQuantity}.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      // this.planPurchaseOrderFormGroup.patchValue({ inspectionQuantity: openQuantity });
      this.planPurchaseOrderFormGroup.patchValue({ inspectionQuantity: 0 });
    } else if (inspectionQuantity < 1 ) {
      this.isReceiveQuantityInvalid = true;
      const errorMessage = `Inspection Qty can't be 0.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
    else {
      this.isInspectionQuantityInvalid = false;
    }
  }
  // CREATING PURCHASE GRN PAYLOAD FOR POST TO SAP API INTEGRATION - @IAK
  createGRN(): void {
    const docNoPurchase = this.planPurchaseOrderFormGroup.get('docNo')?.value;
    const lineNoPurchase = this.planPurchaseOrderFormGroup.get('lineNo')?.value;
    const itemCodePurchase = this.planPurchaseOrderFormGroup.get('itemCode')?.value;
    const inspectionQuantity = Number(this.planPurchaseOrderFormGroup.get('inspectionQuantity')?.value);
    const intQCode = this.planPurchaseOrderFormGroup.get('intCode')?.value;
    // CALLING getPurchaseOrderDetails TO FETCH PURCHASE ORDER DATA
    this._SAPAllServices.getPurchaseOrdersByID(docNoPurchase, lineNoPurchase, itemCodePurchase).subscribe({
      next: (response) => {
        // IF response CONTAINS VALID DATA
        if (response.succeeded && response.data.values.length > 0) {
          const purchaseOrder = response.data.values[0];
          // DYNAMICALLY CREATING GRN PAYLOAD
          const payloadGoodReceiptPO = [
            {
              documentStatus: purchaseOrder.documentStatus,
              docEntry: purchaseOrder.docEntry,
              docNum: purchaseOrder.docNum,
              docDate: purchaseOrder.docDate,
              cardCode: purchaseOrder.cardCode,
              cardName: purchaseOrder.cardName,
              lineNum: purchaseOrder.lineNum,
              itemCode: purchaseOrder.itemCode,
              itemDescription: purchaseOrder.itemDescription,
              quantity: inspectionQuantity,
              price: purchaseOrder.price,
              lineStatus: purchaseOrder.lineStatus,
              remainingOpenQuantity: purchaseOrder.remainingOpenQuantity,
              vatGroup: purchaseOrder.vatGroup,
              warehouse: purchaseOrder.warehouse,
              uoM: purchaseOrder.uoM,
              qStatus: 'tYES',
              qCode: intQCode
            }
          ];
          console.log('DYNAMICALLY CREATED payloadGoodReceiptPO PAYLOAD', payloadGoodReceiptPO);
          // return;
          // CALLING GoodReceiptPurchaseGRN WITH DYNAMICALLY CREATED GRN PAYLOAD
          this._SAPAllServices.GoodReceiptPurchaseGRN(payloadGoodReceiptPO).subscribe({
            next: (grnResponse) => {
              console.log('GRN Created Successfully:', grnResponse);
              if (grnResponse.succeeded) {
                console.log('GRN created successfully in SAP! DocEntry: ' + grnResponse.data[0].docEntry);
                const snackRefSuccess = this._snackBar.open('GRN created successfully in SAP!', 'Close', {
                  duration: 3000,
                  panelClass: ['snackbar-success']
                });
                snackRefSuccess.afterDismissed().subscribe(() => {
                  this.closeOpenQCWithPostToSAP();
                });
              }
            },
            error: (error) => {
              console.error('Error creating GRN:', error);
              console.error('error.message: ', (error.message || 'Unknown error'));
              this._snackBar.open('Failed to create GRN: ' + (error.message || 'Unknown error'), 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
              });
            }
          });
        } else {
          console.error('No purchase order data found in response');
          this._snackBar.open('Failed to fetch purchase order details', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      },
      error: (err) => {
        console.error('Error fetching purchase order:', err);
        this._snackBar.open('Failed to fetch purchase order details: ' + (err.message || 'Unknown error'), 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
  // CLOSE OPEN QC AFTER POSTING TO SAP - @IAK
  closeOpenQCWithPostToSAP() {
    const OpenPOqcId = this.planPurchaseOrderFormGroup.get('id')?.value;
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
      overallStatus: this.planPurchaseOrderFormGroup.get('samplesStatus')?.value,
      id: OpenPOqcId,
      inspectionDateTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime')?.value,
      remarks: this.planPurchaseOrderFormGroup.get('remarks')?.value || 'Closed on GRN creation in SAP',
      isActive: true,
    };
    console.log('CLOSE QC PAYLOAD', closeQCPayloadWithPostToSAP);
    // PUT API CALL TO CLOSE OPEN QC - SET isCLosed TO ture
    this._evaluationPurchaseOrderService.updateToCloseOpenQC(closeQCPayloadWithPostToSAP).subscribe({
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
  // CONFIRMATION DIALOG TO CONFIRM POSTING BEFORE CREATING GRN IN SAP - @IAK
  confirmationPostToSAP() {
    const overallStatus = this.planPurchaseOrderFormGroup.get('samplesStatus')?.value;
    if (overallStatus === true) {
      const confirmation = this._qbsSuccessConfirmationService.open({
        title: ' Good Receipt PO',
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
  // CALLING getPurchaseOrderDetails TO FETCH PURCHASE ORDER DATA
  getPurchaseOrderDetails(docNo: number, lineNo: number, itemCode: string) {
    const docNoPurchase = this.planPurchaseOrderFormGroup.get('docNo')?.value
    const lineNoPurchase = this.planPurchaseOrderFormGroup.get('lineNo')?.value
    const itemCodePurchase = this.planPurchaseOrderFormGroup.get('itemCode')?.value
    this._SAPAllServices.getPurchaseOrdersByID(docNoPurchase, lineNoPurchase, itemCodePurchase).subscribe({
      next: (response) => {
        console.log('Purchase Order Data:', response.data.values);
      },
      error: (err) => {
        console.error('Error fetching purchase order:', err);
      }
    });
  }
  saveRemarksPurchase() {
    const OpenPOqcId = this.planPurchaseOrderFormGroup.get('id')?.value;
    if (!OpenPOqcId) {
      console.error('NO VALID PURCHASE QC ID FOUND AGAINST THIS PO');
      this._snackBar.open('FAILED TO SAVE REMARKS. QC ID MISSING.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }
    const updateRemarksPurchase = {
      isPerformed: true,
      isPostedToSap: false,
      isClosed: false,
      overallStatus: this.planPurchaseOrderFormGroup.get('samplesStatus')?.value,
      id: OpenPOqcId,
      inspectionDateTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime')?.value,
      remarks: this.planPurchaseOrderFormGroup.get('remarks')?.value,
      isActive: true,
    };
    console.log('PAYLOAD', updateRemarksPurchase);
    this._evaluationPurchaseOrderService.updateToCloseOpenQC(updateRemarksPurchase).subscribe({
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
  backTolist() {
    this.router.navigate(['/evaluation-plan/list-of-evaluation-plan']);
  }
  isReceiveQuantityInvalid: boolean = false;
  onReceiveQuantityBlur(): void {
    const receiveQuantity: number = Number(this.planPurchaseOrderFormGroup.value.receiveQuantity);
    const openQuantity: number = Number(this.planPurchaseOrderFormGroup.value.openQuantity);
    if (receiveQuantity > openQuantity) {
      this.isReceiveQuantityInvalid = true;
      const errorMessage = `Receive Qty can't be greater than Open Quantity ${openQuantity}.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.planPurchaseOrderFormGroup.patchValue({ receiveQuantity: 0 });
    } else if (receiveQuantity < 1) {
      this.isReceiveQuantityInvalid = true;
      const errorMessage = `Receive Qty can't be 0.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    } else {
      this.isReceiveQuantityInvalid = false;
    }
  }
  isQCLotNoInvalid: boolean = false;
  onQCLotNoBlur(): void {
    const qcLotNo = this.planPurchaseOrderFormGroup.value.qcLotNo;
    if (qcLotNo.trim() === "") {
      this.isQCLotNoInvalid = true;
      const errorMessage = `QC Lot No is mandatory and can't be empty.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.planPurchaseOrderFormGroup.patchValue({ qcLotNo: '' });
    } else {
      this.isQCLotNoInvalid = false;
    }
  }
  isPlanPurchaseOrderFormValid: boolean = false;
  isPlanPurchaseOrderFormGroupValid(): void {
    const qcLotNoValid = this.planPurchaseOrderFormGroup.get('qcLotNo')?.valid;
    const inspectionQuantityValid = this.planPurchaseOrderFormGroup.get('inspectionQuantity')?.valid;
    const receiveQuantityValid = this.planPurchaseOrderFormGroup.get('receiveQuantity')?.valid;
    const analyzedByValid = this.planPurchaseOrderFormGroup.get('analyzedBy')?.valid;
    console.log('qcLotNo:', qcLotNoValid);
    console.log('inspectionQuantity:', inspectionQuantityValid);
    console.log('receiveQuantity:', receiveQuantityValid);
    console.log('analyzedBy:', analyzedByValid);
    this.isPlanPurchaseOrderFormValid =
      !!(qcLotNoValid && inspectionQuantityValid && receiveQuantityValid && analyzedByValid);
  }
  isAnalyzedByInvalid: boolean = false;
  onAnalyzedByBlur(): void {
    const analyzedBy = this.planPurchaseOrderFormGroup.value.analyzedBy;
    if (analyzedBy.trim() === "") {
      this.isAnalyzedByInvalid = true;
      const errorMessage = `Analyzed By is mandatory and can't be empty.`;
      this._snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      this.planPurchaseOrderFormGroup.patchValue({ analyzedBy: '' });
    } else {
      this.isAnalyzedByInvalid = false;
    }
  }
}