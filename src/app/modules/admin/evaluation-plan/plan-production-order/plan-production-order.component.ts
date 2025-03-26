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
import { ChangeDetectorRef } from '@angular/core';
import { ItemInspectionCardService } from 'app/core/other-core-services/module/item-inspection-card.service';
import { MatSelectModule } from '@angular/material/select';
import { InspectionCardService } from 'app/core/other-core-services/module/inspection-card.service';
import { EvaluationPlanProductionOrderService } from 'app/core/other-core-services/module/evaluation-plan-production-order.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  ],
  templateUrl: './plan-production-order.component.html',
  styleUrl: './plan-production-order.component.scss'
})
export class PlanProductionOrderComponent implements AfterViewInit {
  i: number;
  
  // Plan Purchase Form groups
  selectedOrder: any;
  qualitativeInspectionForm: FormGroup;
  quantitativeInspectionForm: FormGroup;
  isFormSaved = false; // Initialize to false
  isDropdownOpen = false;


  
  
  // Plan Purchase DataSources for tables
  dataSourceQualitativeInspectionPP: MatTableDataSource<any>;
  dataSourceQuantitativeInspectionPP: MatTableDataSource<any>;
  dataSourceUoMIIC: MatTableDataSource<any>;
  dataSourceAddQuantitativeIIC: MatTableDataSource<any>;
  
  // Selected row index for UoM
  selectedRowIndexUoM: number = -1;
  
  // Selected UoM Code
  selectedUoMCode: string = '';
  
  // Plan Purchase Display columns
  displayedColumnsQualitative: string[] = ['parameter', 'passCriteria', 'mandatory', 'result', 'remarks'];
  displayedColumnsQuantitative: string[] = ['parameterQty', 'uoMId', 'mandatoryQty', 'passCriteriaTarget', 'passCriteriaMax', 'passCriteriaMin', 'result', 'remarks'];
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
  
  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _inspectionCardModal: InspectionCardService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _evaluationProductionOrderService: EvaluationPlanProductionOrderService,
    private _snackBar: MatSnackBar,
  ) { }


 

  planProductionOrderFormGroup = this._formBuilder.group({
    intCode: [''], 
    inspectionQuantity: [],
    docNoPP: [''], // API: docNum
    itemCodePP: [''], // API: itemCode
    itemDescriptionPP: [''], // API: productName
    inspectionDateTimePP: [new Date().toISOString()], // API: docDate (converted to ISO)
    datePP: [new Date().toISOString().split('T')[0]], // API: docDate (only date part)
    productionOrderPP: [''], // API: docEntry
    locationPP: [''], // API: warehouse
    lotPP: [], // API: uoM (Assuming it's a number)
    sampleQuantity: [], // API: plannedQuantity
    openQtyPP: [0, Validators.required], // API: completedQuantity
    lotSizeUnitPP: [0, Validators.required], // API: rejectedQuantity
    shiftPP: ['', Validators.required], // No direct mapping, keep empty
    machineNoPP: [''], // No direct mapping, keep empty
    variantPP: [''], // API: inventoryUOM
    bmrPP: [''], // API: itemCode (Assuming same as itemCodePP)
    analyzedByPP: [''], // No direct mapping, keep empty
    inspectionByModalPP: [''], // No direct mapping, keep empty
    inspectionTimeModalPP: [''], // No direct mapping, keep empty
    itemCodeModalPO: [''], // No direct mapping, keep empty
    inspectionQtyModalPO: [''], // No direct mapping, keep empty
    inspectionByModalPO: [''], // No direct mapping, keep empty
    inspectionTimeModalPO: [''], // No direct mapping, keep empty
    receiveQtyPO: [''], // No direct mapping, keep empty
    inspectionDateTimePO: [new Date().toISOString()], // API: docDate (Converted to ISO)
    // lineNum: [''], // No direct mapping, keep empty
    remarks: ['remarks'], // No direct mapping, default value
    itemId: null,
  });


  get sampleQuantity(): number {
    return Number(this.planProductionOrderFormGroup.get('sampleQuantity')?.value) || 0;
  }

  // saveForm(): void {
  //   this.isFormSaved = true;

  //   if (this.planProductionOrderFormGroup.valid) {
  //     console.log(this.planProductionOrderFormGroup.value);
  //     this.isFormSaved = true;
  //     // You can also add your save logic here, e.g., calling an API
  //   } else {
  //     console.error('Form is not valid');
  //   }

  saveForm(): void {
    if (this.planProductionOrderFormGroup.valid) {
      console.log(this.planProductionOrderFormGroup.value);

      const formData = this.planProductionOrderFormGroup.value;
      console.log('PAYLOAD BEFORE sampleQuantity:', formData);

      const inspectionQuantity: number = Number(formData.inspectionQuantity);
      const itemId: string = String(formData.itemId);

      this.getSampleQuantity(inspectionQuantity, itemId)
        .then(() => {
          const updatedFormData = this.planProductionOrderFormGroup.value;
          console.log('PAYLOAD AFTER sampleQuantity:', updatedFormData);
          console.log('Form Saved!');
          this.isFormSaved = true;
        })
        .catch((error) => {
          console.error('Error in getSampleQuantity:', error);
        });
    } else {
      console.error('Form is not valid');
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

  

  setInspectionDateTime() {
    const now = new Date();
    const formattedDateTime = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    this.planProductionOrderFormGroup.get('inspectionDateTimePO')?.setValue(formattedDateTime);
  }

  

  isLinear = false;
  
  // Get form array controls
  get qualitativeInspectionObjects(): FormArray {
    return this.qualitativeInspectionForm.get('qualitativeObjects') as FormArray;
  }
  
  get quantitativeInspectionObjects(): FormArray {
    return this.quantitativeInspectionForm.get('quantitativeObjects') as FormArray;
  }
  


  samplesProductionOrder = [
    // { id: 1, inspectionTime: '11:54 AM', inspectionBy: 'Mr.Hamza', cardColor: '#e8f5e9' },
    // { id: 2, inspectionTime: '08:12 AM', inspectionBy: 'Mr.Hamza', cardColor: '#ffebee' },
    
  ];

  nextSampleId: number = 3; // Since you already have samples 1-4


  addNewSampleForProductionOrder(): void {
    const newSample = {
      id: this.nextSampleId,
      inspectionTime: this.planProductionOrderFormGroup.get('inspectionTimeModalPP').value,
      inspectionBy: this.planProductionOrderFormGroup.get('inspectionByModalPP').value,
      cardColor: this.getRandomCardColor()
    };
  
    this.samplesProductionOrder.push(newSample);
    this.nextSampleId++;
    this.closeDialog();
  }

  getRandomCardColor(): string {
    const colors = ['#e8f5e9', '#ffebee', '#f5f5f5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
 
  
  @ViewChild('dialogTemplateItemsPP') dialogTemplateItemsPP;
  dataSourceItems = new MatTableDataSource([]);
  selectedControlAccountRowIndex: number = -1;
  
  ngOnInit() {

    this.selectedOrder = history.state.selectedOrder; // Access the passed data
    if (this.selectedOrder) {
      this.populateProductionOrderForm(this.selectedOrder); // Populate the form with the data
      this.getItemId(this.selectedOrder.itemCode);
    }

    this._evaluationProductionOrderService.getProductionQCCode().subscribe((productionQCCode) => { 
      console.log('Purchase QC Code:', productionQCCode); // Debugging ke liye
  
      const fullCode = `PQC-000${productionQCCode.data || ''}`; // Code format
      this.planProductionOrderFormGroup.get('intCode')?.setValue(fullCode); // Yahan correct form group use karo
  });

    // Initialize form groups
    this.qualitativeInspectionForm = this.fb.group({
      qualitativeObjects: this.fb.array([])
    });
    
    this.quantitativeInspectionForm = this.fb.group({
      quantitativeObjects: this.fb.array([])
    });
    
    // Add static qualitative inspection data
    this.addQualitativeData();
    
    // Add static quantitative inspection data
    this.addQuantitativeData();

    this.setInspectionDateTime(); // Fetch date-time on load

    
    // Initialize data sources
    this.dataSourceQualitativeInspectionPP = new MatTableDataSource(this.qualitativeInspectionObjects.controls);
    this.dataSourceQuantitativeInspectionPP = new MatTableDataSource(this.quantitativeInspectionObjects.controls);
    this.dataSourceUoMIIC = new MatTableDataSource(this.uomData);
    this.dataSourceAddQuantitativeIIC = new MatTableDataSource(this.quantitativeCharacteristics);
  }

  populateProductionOrderForm(data: any): void {
    console.log('Selected Production Order:', data);
    this.planProductionOrderFormGroup.patchValue({
      // docNoPP: data.docNo, // ✅ API: docNo
      itemCodePP: data.itemCode, // ✅ API: itemCode
      itemDescriptionPP: data.itemDescription, // ✅ API: itemDescription
      inspectionDateTimePP: new Date(data.docDate).toISOString(), // ✅ Convert to ISO
      // datePP: data.docDate.split('T')[0], // ✅ Only extract date part
      productionOrderPP: data.docNo, // ✅ Convert to string
      locationPP: data.warehouse ?? '', // ✅ Handle missing warehouse field
      // lotPP: data.qty ?? 0, // ✅ API: qty
      openQtyPP: data.openQty ?? 0, // ✅ API: openQty
      lotSizeUnitPP: data.qty ?? 0, // ✅ Same as qty
      receiveQtyPO: '', // No direct mapping
      inspectionDateTimePO: new Date().toISOString(), // ✅ Use current date
    });
  }
  
  
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  
  // Add static qualitative data
  addQualitativeData() {
    const qualitativeData = [
      { parameter: 'Visual Inspection Color', passCriteria: 'No visible defects', mandatory: true, result: '', remarks: '' },
      { parameter: 'Color Check', passCriteria: 'Matches standard color', mandatory: true, result: '', remarks: '' },
      { parameter: 'Odor Test', passCriteria: 'No unusual odor', mandatory: false, result: '', remarks: '' },
      { parameter: 'Package Integrity', passCriteria: 'No damage to packaging', mandatory: true, result: '', remarks: '' },
      { parameter: 'Label Verification', passCriteria: 'All labels present and correct', mandatory: true, result: '', remarks: '' }
    ];
    
    qualitativeData.forEach(item => {
      this.qualitativeInspectionObjects.push(
        this.fb.group({
          parameter: [item.parameter],
          passCriteria: [item.passCriteria],
          mandatory: [item.mandatory],
          result: [item.result],
          remarks: [item.remarks]
        })
      );
    });
  }
  
  // Add static quantitative data
  addQuantitativeData() {
    const quantitativeData = [
      { parameterQty: 'Weight', uoMId: 'KG', mandatoryQty: true, passCriteriaTarget: '10.0', passCriteriaMax: '10.5', passCriteriaMin: '9.5', result: '', remarks: '' },
      { parameterQty: 'Length', uoMId: 'CM', mandatoryQty: true, passCriteriaTarget: '20.0', passCriteriaMax: '20.2', passCriteriaMin: '19.8', result: '', remarks: '' },
      { parameterQty: 'Width', uoMId: 'CM', mandatoryQty: true, passCriteriaTarget: '15.0', passCriteriaMax: '15.2', passCriteriaMin: '14.8', result: '', remarks: '' },
      { parameterQty: 'Height', uoMId: 'CM', mandatoryQty: false, passCriteriaTarget: '5.0', passCriteriaMax: '5.2', passCriteriaMin: '4.8', result: '', remarks: '' },
      { parameterQty: 'Volume', uoMId: 'ML', mandatoryQty: false, passCriteriaTarget: '500.0', passCriteriaMax: '510.0', passCriteriaMin: '490.0', result: '', remarks: '' }
    ];
    
    quantitativeData.forEach(item => {
      this.quantitativeInspectionObjects.push(
        this.fb.group({
          parameterQty: [item.parameterQty],
          uoMId: [item.uoMId],
          mandatoryQty: [item.mandatoryQty],
          passCriteriaTarget: [item.passCriteriaTarget],
          passCriteriaMax: [item.passCriteriaMax],
          passCriteriaMin: [item.passCriteriaMin],
          result: [item.result],
          remarks: [item.remarks]
        })
      );
    });
  }
  
  onItemCodeClickPP(): void {
    // console.log('Row Index:', rowIndex);
    // this.selectedControlAccountRowIndex = rowIndex;
    // console.log(this.selectedControlAccountRowIndex);
    const dialogRef = this.dialog.open(this.dialogTemplateItemsPP, {
      width: '70%',
      height: '75vh',
      data: this.dataSourceItems,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('DIALOG CLOSED');
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
      this.quantitativeInspectionObjects.at(index).get('uoMId').setValue(selectedUoM.uoMCode);
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
      this.quantitativeInspectionObjects.push(
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
      this.dataSourceQuantitativeInspectionPP = new MatTableDataSource(this.quantitativeInspectionObjects.controls);
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
    console.log("Action 1 selected");
  }

  // GET ITEM ID API
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
}