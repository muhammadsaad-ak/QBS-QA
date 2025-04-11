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
  
  constructor(
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private _inspectionCardModal: InspectionCardService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _evaluationProductionOrderService: EvaluationPlanProductionOrderService,
    private _sapPlanProductionOrderService: SapPlanProductionOrderService,
    
    
    private _snackBar: MatSnackBar,
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
    remarks:  [''],

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

  onSubmitProductionOrder(): void {
    this.isValidate = true;
    if (this.planProductionOrderFormGroup.valid) {

      const inspectionQuantity: number = Number(this.planProductionOrderFormGroup.value.inspectionQuantity);
      const itemId: string = String(this.planProductionOrderFormGroup.value.itemId);

      console.log('PAYLOAD BEFORE GET sampleQuantity API:', this.planProductionOrderFormGroup.valid);

      this.getSampleQuantity(inspectionQuantity, itemId).then(() => {

        const formData = this.planProductionOrderFormGroup.value;

        console.log('UPDATED FORM DATA AFTER SAMPLE QTY:', formData);

        const { id, intCode, itemCode, itemDescription, inspectionByModalPP, inspectionTimeModalPP, itemCodeModalPO, inspectionQtyModalPO, inspectionByModalPO, inspectionTimeModalPO,receiveQtyPO,
          ...payload } = formData;

        console.log('SENDING Production ORDER PAYLOAD:', payload);

        this.isFormSaved = true; // UI trigger karega
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
      inspectionDateTime: formValue.inspectionDateTime || new Date().toISOString(),
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
      this.planProductionOrderFormGroup.markAllAsTouched();
      return;
    }
  
    if (!this.productionQcId) {
      console.error('QC ID IS MISSING, CANNOT PROCEED!');
      return;
    }
  
    const formValue = this.planProductionOrderFormGroup.value;
  
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
        quantitativeResult: resultValue,
        isQuantitativeResultPassed: !isNaN(resultValue) &&
          resultValue >= (item.min ?? 0) &&
          resultValue <= (item.max ?? 0),
        remarks: item?.remarks || ""
      };
    }) || [];
  
    // FINAL PAYLOAD
    const newSamplePayload = {
      name: `sample-${this.nextSampleId}`,
      inspectionDateTime: new Date().toISOString(),
      inspectionBy: formValue.inspectionBy || "",
      qcId: this.productionQcId.id,
      inspectionObjects: [...qualitativeInspections, ...quantitativeInspections]
    };
  
    console.log('FINAL PAYLOAD:', newSamplePayload);
  
    // API CALL
    this._sapPlanProductionOrderService.addProductionQcSample(newSamplePayload).subscribe({
      next: (response) => {
        console.log('API Response:', response);
  
        // ✅ Add new sample card ONLY once here
        const newSample = {
          id: this.nextSampleId,
          inspectionTime: this.planProductionOrderFormGroup.get('inspectionDateTime')?.value,
          inspectionBy: this.planProductionOrderFormGroup.get('inspectionBy')?.value,
          cardColor: this.getRandomCardColor()
        };
  
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
          console.log('HAHA',this.selectedOrder)
      } else {
          this.populateProductionOrderForm(this.selectedOrder); // Call Perform QC function
      }
      // this.getItemId(this.selectedOrder.itemCode);
  }

    this._evaluationProductionOrderService.getProductionQCCode().subscribe((productionQCCode) => { 
      console.log('Production QC Code:', productionQCCode); // Debugging ke liye
  
      const fullCode = `PQC-000${productionQCCode.data || ''}`; // Code format
      this.planProductionOrderFormGroup.get('intCode')?.setValue(fullCode); // Yahan correct form group use karo
  });

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
      status: data.status ?? 'Ali', // ✅ Ensure default value
    });
}

populateEditProductionOrderForm(data: any): void {
  console.log('Populating Edit QC Form:', data);
  this.planProductionOrderFormGroup.patchValue({
    intCode: data.intCode ?? "",  
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
  });
}

  
  
  ngAfterViewInit() {
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
    console.log('Sample Data:', sample); 
    alert('Sample ID: ' + (sample ? sample.id : 'undefined')); 
  
    if (!sample || !sample.id) {
      console.error('Sample or sample.id is undefined!');
      return; 
    }
    this.qcSampleID = sample.id;
    const dialogRef = this.dialog.open(this.dialogTemplateItemsPP, {
      width: '70%',
      height: '75vh',
      data: {
        qcSampleId: sample.id,
        cardCode: this.cardCode,
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
    // console.log('Row Index:', rowIndex);
    // this.selectedControlAccountRowIndex = rowIndex;
    // console.log(this.selectedControlAccountRowIndex);
    const dialogRef = this.dialog.open(this.dialogTemplateItemsPP, {
      width: '70%',
      height: '75vh',
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
    const dialogRef = this.dialog.open(this.dialogTemplateItemsPP, {
      width: '70%',
      height: '75vh',
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
}