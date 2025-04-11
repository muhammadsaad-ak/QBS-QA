import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {FormArray,FormBuilder,FormsModule,ReactiveFormsModule,} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EvaluationPlanQaOrderService } from 'app/core/other-core-services/module/evaluation-plan-qa-order.service';

@Component({
    selector: 'app-evaluation-plan-qa',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatIconModule,
        MatTabsModule,
        MatTableModule,
        MatCheckboxModule,
    ],
    templateUrl: './evaluation-plan-qa.component.html',
    styleUrl: './evaluation-plan-qa.component.scss',
})
export class EvaluationPlanQaComponent implements OnInit {
    selectedOrder: any;
    isEditMode: boolean = false; // Default false, will be true if in Edit QC mode

    @ViewChild('dialogTemplateItems') dialogTemplateItems;
    @ViewChild('dialogQaTemplateItems') dialogQaTemplateItems;

    qaDialogRef: any;

    displayedColumnsQualitative: string[] = [
        'parameters',
        'passCriteria',
        'Mandatory',
        'remarks',
    ];
    displayedColumnsQuantitative: string[] = [
        'parameters',
        'UOM',
        'Mandatory',
        'Target',
        'Max',
        'Min',
        'remarks',
    ];

    samples = [
        {
            title: 'Sample 1',
            inspectionTime: '5:00 PM',
            inspectionBy: 'Mr. Asad',
        },
    ];

    dataSourceQualitativeInspection: any[] = [];
    dataSourceQuantitativeInspection: any[] = [];
    selectedCavityName: string = '';

    constructor(
        private _evaluationPlanQaOrderService: EvaluationPlanQaOrderService,
        private _evaluationProductionOrderService: EvaluationPlanQaOrderService,
        private _snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private _dialog: MatDialog
    ) {}

    cavity = [
        {
            cName: 'cavity 1',
            InspectionTime: '10:30 AM',
            inspectionBy: 'Mr.Kamran',
            enabled: false,
        },
        {
            cName: 'cavity 2',
            InspectionTime: '10:30 AM',
            inspectionBy: 'Mr.Kamran',
            enabled: false,
        },
        {
            cName: 'cavity 3',
            InspectionTime: '10:30 AM',
            inspectionBy: 'Mr.Kamran',
            enabled: false,
        },
        {
            cName: 'cavity 4',
            InspectionTime: '10:30 AM',
            inspectionBy: 'Mr.Kamran',
            enabled: false,
        },
        {
            cName: 'cavity 5',
            InspectionTime: '10:30 AM',
            inspectionBy: 'Mr.Kamran',
            enabled: false,
        },
    ];

    toggleCavity(index: number): void {
        const cavity = this.cavitiesArray.at(index);
        cavity.get('enabled')?.setValue(!cavity.value.enabled); // Toggle the enabled status
    }

    evaluationplanQAFormGroup = this._formBuilder.group({
        intCode: [''],
        docNo: [''],
        itemCode: [''],
        itemDescription: [''],
        inspectionDateTime: [new Date().toISOString()],
        // prodOrder: [''],
        qcLotNo: [''], 
        docDate: [new Date().toISOString()], 
        // lotSize: [''],
        openQuantity: [], 
        plannedQuantity: [],
        warehouse: [''],
        variant: [''],
        cycleTime: [''],
        itemWeight: [''],
        shift: [''],
        machineNo: [''],
        bmrNo: [''],
        mouldNo: [''],
        cavity: [],
        analyzedBy: [''],
        inspectionBy: [''],
        remarks: [''],
        min: [''],
        max: [''],
        target: [''],
        parameters: ['test'],
        cavities: this._formBuilder.array([]),
        qualitativeInspectionObjects: this._formBuilder.array([]),
        quantitativeInspectionResults: this._formBuilder.array([]),
    });

    ngOnInit(): void {
        this.selectedOrder = history.state.selectedOrder; // Access the passed data
        this.isEditMode = history.state.from === 'evaluationPlan'; // Set edit mode if coming from Edit QC

        if (this.selectedOrder) {
            this.populateProductionOrderFormQA(this.selectedOrder); // Populate the form with the data
            console.log('HAHA Production Order Form 1', this.selectedOrder);

            // this.getItemId(this.selectedOrder.itemCode);
        }

        if (this.selectedOrder) {
            if (this.isEditMode) {
                this.populateEditProductionOrderFormQA(this.selectedOrder); // Call Edit QC function
                // this.ListAllProductionQCSamplesByQcId(this.selectedOrder.id)
                console.log('HAHA Production Order Form', this.selectedOrder);
            } else {
                this.populateProductionOrderFormQA(this.selectedOrder); // Call Perform QC function
            }
            // this.getItemId(this.selectedOrder.itemCode);
        }

        this._evaluationPlanQaOrderService.getProductionQACode().subscribe((productionQACode) => {
                const fullCode = `PQA-000${productionQACode.data || ''}`;
                this.evaluationplanQAFormGroup
                    .get('intCode')
                    ?.setValue(fullCode);
            });

        const staticData = [
            {
                parameters: 'Color Check',
                passCriteria: 'Should be Blue',
                Mandatory: true,
                qualitativeResultId: 'Passed',
                remarks: 'Looks good',
            },
            {
                parameters: 'Weight Check',
                passCriteria: 'Less than 5kg',
                Mandatory: false,
                qualitativeResultId: 'Failed',
                remarks: 'Overweight',
            },
        ];

        this.dataSourceQualitativeInspection = staticData;

        const formArray = this.evaluationplanQAFormGroup.get(
            'qualitativeInspectionObjects'
        ) as FormArray;

        staticData.forEach((item) => {
            formArray.push(
                this._formBuilder.group({
                    parameters: [item.parameters],
                    passCriteria: [item.passCriteria],
                    Mandatory: [item.Mandatory],
                    qualitativeResultId: [item.qualitativeResultId],
                    remarks: [item.remarks],
                })
            );
        });

        const staticsData = [
            {
                parameters: 'Color Check',
                UOM: 'Should be Blue',
                Mandatory: true,
                Target: 12,
                Max: 3,
                Min: 5,
                results: 'Looks good',
                remarks: 'Looks good',
            },
            {
                parameters: 'Weight Check',
                UOM: 'Less than 5kg',
                Mandatory: false,
                Target: 12,
                Max: 3,
                Min: 5,
                results: 'Looks good',
                remarks: 'Looks good',
            },
        ];

        this.dataSourceQuantitativeInspection = staticsData;

        const formsArray = this.evaluationplanQAFormGroup.get(
            'quantitativeInspectionResults'
        ) as FormArray;

        staticsData.forEach((item) => {
            formsArray.push(
                this._formBuilder.group({
                    parameters: [item.parameters],
                    UOM: [item.UOM],
                    Mandatory: [item.Mandatory],
                    Target: [item.Target],
                    Max: [item.Max],
                    Min: [item.Min],
                    results: [item.results],
                    remarks: [item.remarks],
                })
            );
        });
    }

    get rows() {
        return this.evaluationplanQAFormGroup.get(
            'qualitativeInspectionObjects'
        ) as FormArray;
    }

    get rowes() {
        return this.evaluationplanQAFormGroup.get(
            'quantitativeInspectionResults'
        ) as FormArray;
    }

    get cavitiesArray(): FormArray {
        return this.evaluationplanQAFormGroup.get('cavities') as FormArray;
    }

    generateCavitiesX(): void {
      if (this.evaluationplanQAFormGroup.invalid) {
        this.evaluationplanQAFormGroup.markAllAsTouched();
        return;
      }
    
      const payload = this.evaluationplanQAFormGroup.value;
      console.log('Payload:', payload);
      return;
    
      this._evaluationProductionOrderService.addProductionQA(payload).subscribe(
        (response) => {
          if (response.isRequestSuccess) {
            console.log('API RUN SUCCESSFULLY.', payload);
            this._snackBar.open('Production QA added successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
    
            // Only generate cavities on successful API response
            this.cavitiesArray.clear();
    
            const numberOfCavities = +payload.cavity;
    
            for (let i = 0; i < numberOfCavities; i++) {
              this.cavitiesArray.push(
                this._formBuilder.group({
                  cName: `Cavity ${i + 1}`,
                  InspectionTime: '10:30 AM',
                  InspectionBy: 'Mr.Kamran',
                  enabled: false,
                })
              );
            }
          } else {
            this._snackBar.open('Failed to add Production QA!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        },
        (error) => {
          this._snackBar.open('Something went wrong. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
          console.error('Error during AddProductionQA:', error);
        }
      );
    }

    generateCavities(): void {
      const formData = this.evaluationplanQAFormGroup.value;
    
      // 🧹 Exclude extra form fields
      const {
        intCode,
        itemCode,
        itemDescription,
        max,
        min,
        qualitativeInspectionObjects,
        quantitativeInspectionResults,
        target,
        inspectionBy,
        remarks,
        cavities,
        ...payload
      } = formData;
    
      console.log('SENDING Production QA PAYLOAD:', payload);
    
      // ✅ Call API to save the form first
      this._evaluationProductionOrderService.addProductionQA(payload).subscribe(
        (response) => {
          if (response?.isRequestSuccess) {
            this._snackBar.open('Production QA added successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
    
            // 🛠 Generate cavities after saving
            this.cavitiesArray.clear();
            const numberOfCavities = this.evaluationplanQAFormGroup.get('cavity')?.value;
    
            for (let i = 0; i < numberOfCavities; i++) {
              this.cavitiesArray.push(
                this._formBuilder.group({
                  cName: `Cavity ${i + 1}`,
                  InspectionTime: '10:30 AM',
                  InspectionBy: 'Mr.Kamran',
                  enabled: false,
                })
              );
            }
          }
        },
        (error) => {
          console.error('Error adding Production QA:', error);
          this._snackBar.open('Error saving Production QA.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      );
    }
    
    
    

    onEvaluationPlanQaModal(cav: any, index: any): void {
        if (!cav.enabled) return;

        const cavityNumber = `Cavity ${index + 1}`;

        console.log('Modal Open:', cav);
        console.log('Opening modal for:', cavityNumber);

        this.selectedCavityName = cavityNumber;

        console.log('Opening modal for:', this.selectedCavityName);

        const dialogRef = this._dialog.open(this.dialogTemplateItems, {
            width: '70%',
            height: '75vh',
        });

        dialogRef.afterClosed().subscribe((result) => {
            console.log(result);

            this.closeDialog();
        });
    }

    onCavitySampleQaModal(): void {
        this.qaDialogRef = this._dialog.open(this.dialogQaTemplateItems, {
            width: '70%',
            height: '75vh',
        });

        this.qaDialogRef.afterClosed().subscribe((result) => {
            console.log('QA Dialog Closed:', result);
            this.closeQaManually();
            this.qaDialogRef = null;
        });
    }

    saveAndCloseQa() {
        const inspectionBy =
            this.evaluationplanQAFormGroup.get('InspectionBy')?.value || 'N/A';
        const newSample = {
            title: `Sample ${this.samples.length + 1}`,
            inspectionTime: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            inspectionBy: inspectionBy,
        };

        this.samples.push(newSample);
        this.closeQaManually();
    }

    closeDialog(): void {
        this._dialog.closeAll();
    }

    closeQaManually(): void {
        if (this.qaDialogRef) {
            this.qaDialogRef.close();
        }
    }

    populateProductionOrderFormQA(data: any): void {
        console.log('Selected Production Order QA:', data);
        this.evaluationplanQAFormGroup.patchValue({
            itemCode: data.itemCode ?? 'N/A',
            itemDescription: data.itemDescription ?? 'N/A',
            inspectionDateTime: new Date().toISOString(), // Add missing field
            docDate: data.docDate,
            docNo: data.docNo.toString(), // Convert to string
            warehouse: data.warehouse,
            openQuantity: data.openQty,
            plannedQuantity: data.qty ?? '-', // ✅ Same as qty
            qcLotNo: data.lotNo ?? 'N/A',
            shift: data.shift ?? 'N/A',
            machineNo: data.machine ?? 'N/A',
            bmrNo: data.bmr ?? 'N/A',
            mouldNo: data.mold ?? 'N/A',
            cavity: data.cavity !== undefined ? data.cavity.toString() : 'N/A', // ✅ Convert safely
            cycleTime: data.cycleTime ?? 'N/A', // ✅ Convert safely
            itemWeight: data.weight !== undefined ? data.weight.toString() : 'N/A', // ✅ Convert safely
            variant: data.variant ?? 'N/A',
            // analyzedBy: data.analyzedBy ?? '', // ✅ Ensure empty string if not provided
            // status: data.status ?? 'Ali', // ✅ Ensure default value
        });
    }

    populateEditProductionOrderFormQA(data: any): void {
        console.log('Populating Edit QC Form:', data);
        this.evaluationplanQAFormGroup.patchValue({
            // intCode: data.intCode ?? "",
            // itemCode: data.itemCode ?? "",
            // itemDescription: data.itemDescription ?? "",
            // openQuantity: data.openQuantity ?? 0,
            // analyzedBy: data.analyzedBy,
            // status: data.status ?? "",
            // sampleQuantity: data.sampleQuantity ?? 0,
            // qcLotNo: data.qcLotNo ?? "",
            // shift: data.shift ?? "",
            // machineNo: data.machineNo ?? 'N/A',
            // variant: data.variant ?? 'N/A',
            // bmrNo: data.bmrNo ?? 'N/A',
            // mouldNo: data.mouldNo ?? 'N/A',
            // cavity: data.cavity,
            // cycleTime: data.cycleTime ?? 'N/A',
            // itemWeight: data.itemWeight ?? 'N/A',
            // inspectionQuantity: data.inspectionQuantity,
        });
    }
}
