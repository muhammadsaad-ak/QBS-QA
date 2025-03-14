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
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvaluationPlanPurchaseOrderService } from 'app/core/other-core-services/module/evaluation-plan-purchase-order.service';

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
  styleUrl: './plan-purchase-order.component.scss'
})
export class PlanPurchaseOrderComponent implements AfterViewInit {
  i: number;
  // Plan Purchase Form groups
  qualitativeInspectionForm: FormGroup;
  quantitativeInspectionForm: FormGroup;
  isFormSaved = false; // Initialize to false
  isDropdownOpen = false;
  isValidate = false;


    
  
  // Plan Purchase DataSources for tables
  dataSourceQualitativeInspection: MatTableDataSource<any>;
  dataSourceQuantitativeInspection: MatTableDataSource<any>;
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
    private _snackBar: MatSnackBar,
    private _evaluationPurchaseOrderService: EvaluationPlanPurchaseOrderService
  ) {}

  // planPurchaseOrderFormGroup = this._formBuilder.group({
  //   isActive: [true],
  //   docNoPO: ['DOC-2024-001'],
  //   itemCodePO: ['ITEM-123'],
  //   itemDescriptionPO: ['Test Item Description'],
  //   inspectionDateTimePO: ['2024-02-27 10:00 AM'],
  //   datePO: ['2024-02-20'],
  //   purchaseOrderPO: ['PO-2024-001'],
  //   quantityPO: ['1000'],
  //   openQuantityPO: ['500'],
  //   vendorPO: ['Vendor XYZ'],
  //   qcLotNoPO: ['', Validators.required],
  //   receiveQtyPO: ['', Validators.required],
  //   inspectionQtyPO: ['', Validators.required],
  //   samplePO: ['2'],
  //   locationPO: ['Warehouse A'],
  //   itemCodeModalPO: ['ITEM-123'],
  //   inspectionQtyModalPO: ['50'],
  //   inspectionByModalPO: ['Mr. Kamran'],
  //   inspectionTimeModalPO: ['10:30 AM'],
  //   remarks: ['']

  // });

  planPurchaseOrderFormGroup = this._formBuilder.group({
    id: [null], // string
    intCode: [0], // number
    documentNumber: [5], // number
    openQuantity: [20], // number
    status: ['true'], // string
    documentType: ['true'], // string
    documentDate: [new Date().toISOString()], // Date string
    lineNo: [0], // number
    receiveQuantity: [1000], // number
    inspectionQuantity: [200], // number
    inspectionDateTime: [new Date().toISOString()], // Date string
    qcLotNo: [56], // number
    poDate: [new Date().toISOString()], // Date string
    poCode: ['88'], // string
    location: ['KHI'], // string
    poQuantity: [32], // number
    sampleQuantity: [5], // number
    vendor: ['QBS'], // string
    remarks: ['remarks'], // string
    itemId: ['43a3787f-5bad-4ecb-8781-94a7ef55e864'] // string
  });
  
  get sampleQuantity(): number {
    return Number(this.planPurchaseOrderFormGroup.get('samplePO')?.value) || 0;
  }  
  

  saveForm(): void {
    this.isFormSaved = true;

    if (this.planPurchaseOrderFormGroup.valid) {
      console.log(this.planPurchaseOrderFormGroup.value);
      // You can also add your save logic here, e.g., calling an API
    } else {
      console.error('Form is not valid');
    }
    this.isFormSaved = true;

  }

  onSubmitPurchaseOrder(): void {
    this.isValidate = true;
    if (this.planPurchaseOrderFormGroup.valid) {
      const formData = this.planPurchaseOrderFormGroup.value;
      console.log('SENDING PURCHASE ORDER PAYLOAD:', formData);

      this._evaluationPurchaseOrderService.AddPurchaseOrder(formData).subscribe(
        (response) => {
          if (response.succeeded) {
            console.log('API RUN SUCCESSFULLY.', formData);
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
    } else {
      this.isValidate = false;
      this._snackBar.open('Please fill all mandatory fields.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
    }
  }

  cancelForm() {
    // Reset the form or navigate away
    this.planPurchaseOrderFormGroup.reset();
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

    this.planPurchaseOrderFormGroup.get('inspectionDateTime')?.setValue(formattedDateTime);
  }


  


  isLinear = false;
  
  // Get form array controls
  get qualitativeInspectionObjects(): FormArray {
    return this.qualitativeInspectionForm.get('qualitativeObjects') as FormArray;
  }
  
  get quantitativeInspectionObjects(): FormArray {
    return this.quantitativeInspectionForm.get('quantitativeObjects') as FormArray;
  }
  
  samplesPurchaseOrder = [    ];


  nextSampleId: number = 1; // Since you already have samples 1-4
  addNewSampleForPurchaseOrder(): void {
    // Create a new sample object with form data
    const newSample = {
      id: this.nextSampleId,
      inspectionTime: this.planPurchaseOrderFormGroup.get('inspectionTimeModalPO').value,
      inspectionBy: this.planPurchaseOrderFormGroup.get('inspectionByModalPO').value,
      cardColor: this.getRandomCardColor() // Function to get a color
    };
    
    // Add to samples array
    this.samplesPurchaseOrder.push(newSample);
    
    // Increment the sample ID for next time
    this.nextSampleId++;
    
    // Close the dialog
    this.closeDialog();
  }


  getRandomCardColor(): string {
    const colors = ['#e8f5e9', '#ffebee', '#f5f5f5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
 
  
  @ViewChild('dialogTemplateItems') dialogTemplateItems;
  dataSourceItems = new MatTableDataSource([]);
  selectedControlAccountRowIndex: number = -1;
  
  ngOnInit() {
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
    this.dataSourceQualitativeInspection = new MatTableDataSource(this.qualitativeInspectionObjects.controls);
    this.dataSourceQuantitativeInspection = new MatTableDataSource(this.quantitativeInspectionObjects.controls);
    this.dataSourceUoMIIC = new MatTableDataSource(this.uomData);
    this.dataSourceAddQuantitativeIIC = new MatTableDataSource(this.quantitativeCharacteristics);
  }
  
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  
  // Add static qualitative data
  addQualitativeData() {
    const qualitativeData = [
      { parameter: 'Visual Inspection', passCriteria: 'No visible defects', mandatory: true, result: '', remarks: '' },
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
  
  // Display Item Modal
  onPurchaseOrderModal(): void {
    // console.log('Row Index:', rowIndex);
    // this.selectedControlAccountRowIndex = rowIndex;
    // console.log(this.selectedControlAccountRowIndex);
    const dialogRef = this.dialog.open(this.dialogTemplateItems, {
      width: '70%',
      height: '75vh',
      data: this.dataSourceItems,
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('DIALOG CLOSED');
    });
  }

  // onEditSample(sample: any): void {
  //   const dialogRef = this.dialog.open(this.dialogTemplateItems, {
  //     width: '70%',
  //     height: '75vh',
  //     data: { 
  //       allItems: this.dataSourceItems,
  //       selectedSample: { ...sample } // Clone object to avoid direct mutation
  //     },
  //   });
  
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       // Find index of the edited sample in the array
  //       const index = this.samplesPurchaseOrder.findIndex(s => s.id === sample.id);
  //       if (index !== -1) {
  //         this.samplesPurchaseOrder[index] = result; // Update the existing sample instead of pushing new one
  //       }
  //     }
  //     console.log('EDIT DIALOG CLOSED');
  //   });
  // }
  
  
  
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
      this.dataSourceQuantitativeInspection = new MatTableDataSource(this.quantitativeInspectionObjects.controls);
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
  
  // action2() {
  //   console.log("Action 2 selected");
  // }
  

  
}