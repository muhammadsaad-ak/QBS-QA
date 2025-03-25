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
  ],
  templateUrl: './plan-purchase-order.component.html',
  styleUrls: ['./plan-purchase-order.component.scss']
})
export class PlanPurchaseOrderComponent implements AfterViewInit, OnInit {
  selectedOrder: any;
  isFormSaved = false;
  isDropdownOpen = false;
  isValidate = false;
  cardCode: any;
  purchaseQcId: any
  dataSourceQualitativeInspection: MatTableDataSource<any>;
  dataSourceQuantitativeInspection: MatTableDataSource<any>;
  dataSourceUoMIIC: MatTableDataSource<any>;
  dataSourceAddQuantitativeIIC: MatTableDataSource<any>;

  selectedRowIndexUoM: number = -1;
  selectedUoMCode: string = '';

  displayedColumnsQualitative: string[] = ['inspectionCharacteristicName', 'inspectionCharacteristicSingleCriteria', 'isMandatory', 'qualitativeResultId', 'remarks'];
  displayedColumnsQuantitative: string[] = ['inspectionCharacteristicName', 'uoMCode', 'isMandatory', 'target', 'max', 'min', 'quantitativeResult', 'remarks'];
  displayedColumnsUoMIIC: string[] = ['code', 'description'];
  displayedColumnsAddQuantitativeIIC: string[] = ['inspectionCode', 'inspectionDescription'];

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
    private _activeRoute: ActivatedRoute
  ) { }

  planPurchaseOrderFormGroup = this._formBuilder.group({
    id: [''],
    intCode: [0],
    documentNumber: [5],
    openQuantity: [20],
    status: [''],
    documentType: [''],
    documentDate: [new Date().toISOString()],
    lineNo: [null],
    receiveQuantity: [],
    inspectionQuantity: [],
    inspectionDateTime: [new Date().toISOString()],
    qcLotNo: [],
    docDate: [new Date().toISOString()],
    docNo: [],
    warehouse: [''],
    sapQuantity: [],
    sampleQuantity: [3],
    vendor: [''],
    remarks: ['remarks'],
    itemId: [null],
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
    inspectionObjects: this.fb.array([this.createInspectionObject()])
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

  getQualitativeResultPassStatusResults(index: number): FormArray {
    return this.planPurchaseOrderFormGroup
      .get('qualitativeInspectionObjects')?.get(`${index}.qualitativeResultPassStatusResults`) as FormArray;
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

  onSubmitPurchaseOrder(): void {
    this.isValidate = true;
    if (this.planPurchaseOrderFormGroup.valid) {
      const formData = this.planPurchaseOrderFormGroup.value;
      console.log('SENDING PURCHASE ORDER PAYLOAD:', formData);
      this.isFormSaved = true;
      // return;
      this._evaluationPurchaseOrderService.AddPurchaseOrder(formData).subscribe(
        (response) => {
          if (response.succeeded) {
            this._snackBar.open('Purchase Order added successfully!', 'Close', { duration: 3000, panelClass: ['snackbar-success'] });
          }
        },
        (error) => {
          this._snackBar.open('Error adding purchase order.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
        }
      );
    } else {
      this.isValidate = false;
      this._snackBar.open('Please fill all mandatory fields.', 'Close', { duration: 3000, panelClass: ['snackbar-error'] });
    }
  }

  cancelForm() {
    this.planPurchaseOrderFormGroup.reset();
  }

  samplesPurchaseOrder = [];
  nextSampleId: number = 1;

  getPurchaseByQcCode(itemCode: string, docNo: number, lineNo: number) {
    this._sapPlanPurchaseOrderService.GetPurchaseQCId(itemCode, docNo, lineNo).subscribe({
      next: (response) => {
        this.purchaseQcId = response.data;
        this.planPurchaseOrderFormGroup.patchValue({
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

  addNewSampleForPurchaseOrder(): void {
    if (!this.planPurchaseOrderFormGroup.valid) {
      console.error("FORM IS INVALID");
      console.log("FORM ERRORS:", this.planPurchaseOrderFormGroup.errors);
      console.log("FORM VALUE:", this.planPurchaseOrderFormGroup.value);
      console.log("INSPECTION BY ERRORS:", this.planPurchaseOrderFormGroup.get('inspectionBy')?.errors);
      console.log("INSPECTION DATETIME ERRORS:", this.planPurchaseOrderFormGroup.get('inspectionDateTime')?.errors);
      this.planPurchaseOrderFormGroup.markAllAsTouched();
      return;
    }

    if (!this.purchaseQcId) {
      console.error('QC ID IS MISSING, CANNOT PROCEED!');
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
    // STEP 3: COMBINE QUALITATIVE AND QUANTITATIVE INSPECTIONS INTO inspectionObjects
    const inspectionObjects = [...qualitativeInspections, ...quantitativeInspections];
    // STEP 4: CREATING THE FINAL PAYLOAD
    const newSamplePayload = {
      name: `sample-${this.nextSampleId}`,
      inspectionDateTime: new Date().toISOString(),
      inspectionBy: formValue.inspectionBy || "",
      qcId: this.purchaseQcId.id,
      inspectionObjects: inspectionObjects
    };
    console.log('FINAL PAYLOAD:', newSamplePayload);
    // STEP 5: CALLING THE POST API
    this._sapPlanPurchaseOrderService.addPurchaseQcSample(newSamplePayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.closeDialog();
      },
      error: (error) => {
        console.error('API Error:', error);
        // alert('FAILED TO SAVE SAMPLE.');
      }
    });
    const newSample = {
      id: this.nextSampleId,
      inspectionTime: this.planPurchaseOrderFormGroup.get('inspectionDateTime').value,
      inspectionBy: this.planPurchaseOrderFormGroup.get('inspectionBy').value,
      cardColor: this.getRandomCardColor()
    };
    this.samplesPurchaseOrder.push(newSample);
    this.nextSampleId++;
    this.closeDialog();
  }



  getRandomCardColor(): string {
    const colors = ['#e8f5e9', '#ffebee', '#f5f5f5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  @ViewChild('dialogTemplateItems') dialogTemplateItems;

  ngOnInit() {
    this.selectedOrder = history.state.selectedOrder;

    if (this.selectedOrder) {
      this.populateForm(this.selectedOrder);
      this.getItemId(this.selectedOrder.itemCode);
    }



    this.dataSourceQualitativeInspection = new MatTableDataSource(this.qualitativeInspectionObjects.controls);
    this.dataSourceQuantitativeInspection = new MatTableDataSource(this.quantitativeInspectionResults.controls);
    this.dataSourceUoMIIC = new MatTableDataSource(this.uomData);
    this.dataSourceAddQuantitativeIIC = new MatTableDataSource(this.quantitativeCharacteristics);
  }

  populateForm(data: any): void {
    this.planPurchaseOrderFormGroup.patchValue({
      id: "",
      intCode: 0,
      documentNumber: data.docNo,
      openQuantity: data.openQty,
      status: data.status,
      documentType: "",
      documentDate: new Date().toISOString(),
      lineNo: data.lineNo,
      receiveQuantity: 0,
      inspectionQuantity: 0,
      inspectionDateTime: new Date().toISOString(),
      qcLotNo: [],
      docDate: data.docDate,
      docNo: data.docNo.toString(),
      warehouse: data.warehouse,
      sapQuantity: data.qty,
      sampleQuantity: 3,
      vendor: data.cardName,
      remarks: "",
      itemDescription: data.itemDescription,
      itemCode: data.itemCode,

    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  onPurchaseOrderModal(): void {
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
    this.getPurchaseByQcCode(
      this.selectedOrder.itemCode,
      this.selectedOrder.docNo,
      this.selectedOrder.lineNo
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
          this.planPurchaseOrderFormGroup.patchValue({
            itemCode: this.cardCode.itemId || '',
            itemDescription: this.cardCode.itemDescription || ''
          });
          this.populateQualitativeAndQuantitativeData(this.cardCode);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      }
    });
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
        }
      },
      error: (err) => {
        console.error('SERVICE ERROR:', err);
      }
    });
  }
}