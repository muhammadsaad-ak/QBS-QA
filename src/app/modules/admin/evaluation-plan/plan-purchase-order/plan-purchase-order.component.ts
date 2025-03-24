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
    poDate: [new Date().toISOString()],
    poCode: [],
    location: [''],
    poQuantity: [],
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
        console.log(this.purchaseQcId, 'purchaseQcId');
        this.addNewSampleForPurchaseOrder()
        },
        error: (err) => {
          console.error('SERVICE ERROR:', err);
          }
    })
  }

addNewSampleForPurchaseOrder(): void {
  if (!this.planPurchaseOrderFormGroup.valid) {
    console.error("Form is invalid");
    return;
  }

  if (!this.purchaseQcId) {
    console.error('QC ID is missing, cannot proceed!');
    return;
  }

  const formValue = this.planPurchaseOrderFormGroup.value;


 const qualitativeInspections = formValue.qualitativeInspectionObjects?.map((item: any) => {
  const qualitativeResultPassStatusResults = item?.qualitativeResultPassStatusResults || [];

let qualitativeResultId = "";
let qualitativeResultIds: any[] = [];

if (qualitativeResultPassStatusResults.length > 0) {
  qualitativeResultPassStatusResults.forEach((status, index) => {
 
    if (status.qualitativeResultId) {
      qualitativeResultId = status.qualitativeResultId;
    }

    qualitativeResultIds.push({ rowIndex: index, qualitativeResultId });
  });
}

  return {
    qualitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || "",
    qualitativeResultId, 
    isQualitativeResultPassed: !(item?.qualitativeResultPassStatusResults?.some((status: any) => status.isPassed === false)) || true,
    remarks: item?.remarks || "",
  };
}) || [];
 

  const quantitativeInspections = formValue.quantitativeInspectionResults?.map((item: any) => ({
    quantitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || "",

    // quantitativeResult: item?.quantitativeResult !== undefined && item?.quantitativeResult !== null 
    // ? item.quantitativeResult 
    // : 0,
    
   isQuantitativeResultPassed: (item?.quantitativeResult !== undefined &&
    item.quantitativeResult >= (item.min ?? 0) &&
    item.quantitativeResult <= (item.max ?? 0)) ? true : false,

    remarks: item?.remarks || "",
  })) || [];

  const newSamplePayload = {
    inspectionDateTime: new Date().toISOString(), 
    inspectionBy: formValue.inspectionBy || "", 
    qcId: this.purchaseQcId.id,
    quantitativeResult: formValue.result || 0,
    inspectionObjects: [...qualitativeInspections, ...quantitativeInspections], 
  };
  console.log('Final Payload:', newSamplePayload);

  // Step 7: Call the service to send the payload to the API
  // this._sapPlanPurchaseOrderService.addPurchaseQcSample(newSamplePayload).subscribe({
  //   next: (response) => {
  //     console.log('API Response:', response);
  //     this.closeDialog(); 
  //   },
  //   error: (error) => {
  //     console.error('API Error:', error);
  //   }
  // });
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
      lineNo: 0,
      receiveQuantity: 0,
      inspectionQuantity: 0,
      inspectionDateTime: new Date().toISOString(),
      qcLotNo: [],
      poDate: data.docDate,
      poCode: data.docNo.toString(),
      location: data.warehouse,
      poQuantity: data.qty,
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
    this.getCardByItemCode(this.selectedOrder.itemCode);
    this.getPurchaseByQcCode(
      this.selectedOrder.itemCode, 
      this.selectedOrder.docNo, 
      this.selectedOrder.lineNo
    )

    dialogRef.afterClosed().subscribe((result) => {
      console.log('DIALOG CLOSED');
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