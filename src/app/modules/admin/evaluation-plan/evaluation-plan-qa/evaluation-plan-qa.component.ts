import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {FormArray,FormBuilder,FormGroup,FormsModule,ReactiveFormsModule, Validators,} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EvaluationPlanQaOrderService } from 'app/core/other-core-services/module/evaluation-plan-qa-order.service';
import {MatSelectModule} from '@angular/material/select';

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
        MatSelectModule
    ],
    templateUrl: './evaluation-plan-qa.component.html',
    styleUrl: './evaluation-plan-qa.component.scss',
})
export class EvaluationPlanQaComponent implements OnInit {
    selectedOrder: any;
    isEditMode: boolean = false; // Default false, will be true if in Edit QC mode
    productionQAId: any; // Variable to hold the production QA ID
    cardCode: any;
    samplesStatus: boolean | null = null;
    selectedCavity: any;
    selectedCavityIdForQaModal: string | null = null;
    selectedCavityId: string | null = null; // class level variable to use in payload
    samplesByCavity: { [cavityId: string]: any[] } = {};


    


    dataSourceQualitativeInspection: MatTableDataSource<any>;
    dataSourceQuantitativeInspection: MatTableDataSource<any>;


    @ViewChild('dialogTemplateItems') dialogTemplateItems;
    @ViewChild('dialogQaTemplateItems') dialogQaTemplateItems;

    qaDialogRef: any;
    dialogRefs: MatDialogRef<any>[] = [];
    selectedRowIndex: number | null = null;

    displayedColumnsQualitative: string[] = [
        'inspectionCharacteristicName',
        'inspectionCharacteristicSingleCriteria',
        'isMandatory',
        'qualitativeResultId',
        'remarks',
    ];
    displayedColumnsQuantitative: string[] = [
        'inspectionCharacteristicName',
        'uoMCode',
        'isMandatory',
        'target',
        'max',
        'min',
        'quantitativeResult',
        'remarks',
    ];

    samples = [
        // {
        //     title: 'Sample 1',
        //     inspectionTime: '5:00 PM',
        //     inspectionBy: 'Mr. Asad',
        // },
    ];

    // dataSourceQualitativeInspection: any[] = [];
    // dataSourceQuantitativeInspection: any[] = [];
    selectedCavityName: string = '';

    constructor(
        private _evaluationPlanQaOrderService: EvaluationPlanQaOrderService,
        private _evaluationPlanQAOrderService:  EvaluationPlanQaOrderService,
        private _evaluationProductionOrderService: EvaluationPlanQaOrderService,
        private _snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private fb: FormBuilder,
        private _dialog: MatDialog
    ) {}

    cavityNo = [
        // {
        //     cName: 'cavity 1',
        //     InspectionTime: '10:30 AM',
        //     inspectionBy: 'Mr.Kamran',
        //     enabled: false,
        // },
        // {
        //     cName: 'cavity 2',
        //     InspectionTime: '10:30 AM',
        //     inspectionBy: 'Mr.Kamran',
        //     enabled: false,
        // },
        // {
        //     cName: 'cavity 3',
        //     InspectionTime: '10:30 AM',
        //     inspectionBy: 'Mr.Kamran',
        //     enabled: false,
        // },
        // {
        //     cName: 'cavity 4',
        //     InspectionTime: '10:30 AM',
        //     inspectionBy: 'Mr.Kamran',
        //     enabled: false,
        // },
        // {
        //     cName: 'cavity 5',
        //     InspectionTime: '10:30 AM',
        //     inspectionBy: 'Mr.Kamran',
        //     enabled: false,
        // },
    ];

    toggleCavity(index: number): void {
        const cavity = this.cavitiesArray.at(index);
        cavity.get('enabled')?.setValue(!cavity.value.enabled); // Toggle the enabled status
    }

    evaluationplanQAFormGroup = this._formBuilder.group({
        intCode: [''],
        docNum: [''],
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
        status: [''],
        mouldNo: [''],
        cavityNo: [],
        analyzedBy: [''],
        itemId: [''],
        inspectionBy: [''],
        remarks: [''],
        min: [''],
        max: [''],
        target: [''],
        inspectionCharacteristicName: ['test'],
        cavities: this.fb.array([]),
        qualitativeInspectionObjects: this.fb.array([]),
        quantitativeInspectionResults: this.fb.array([]),
        qaId: [''],
        result: [0],
        inspectionObjects: this.fb.array([this.createInspectionObject()]),
        sampleName: [''],
        isFlexible: [false],
        samplesStatus: [false],
        cavityId: [''],

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
        return this.evaluationplanQAFormGroup.get('inspectionObjects') as FormArray;
      }

    ngOnInit(): void {
        this.selectedOrder = history.state.selectedOrder; // Access the passed data
        this.isEditMode = history.state.from === 'evaluationPlan'; // Set edit mode if coming from Edit QC

        if (this.selectedOrder) {
            this.populateProductionOrderFormQA(this.selectedOrder); // Populate the form with the data
            console.log('HAHA Production Order Form 1', this.selectedOrder);

            this.getItemId(this.selectedOrder.itemCode);
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
            
        this.dataSourceQualitativeInspection = new MatTableDataSource(this.qualitativeInspectionObjects.controls);
        this.dataSourceQuantitativeInspection = new MatTableDataSource(this.quantitativeInspectionResults.controls);
        // const staticData = [
        //     {
        //         inspectionCharacteristicName: 'Color Check',
        //         inspectionCharacteristicSingleCriteria: 'Should be Blue',
        //         isMandatory: true,
        //         qualitativeResultId: 'Passed',
        //         remarks: 'Looks good',
        //     }
           
        // ];

        // this.dataSourceQualitativeInspection = staticData;

        // const formArray = this.evaluationplanQAFormGroup.get(
        //     'qualitativeInspectionObjects'
        // ) as FormArray;

        // staticData.forEach((item) => {
        //     formArray.push(
        //         this.fb.group({
        //             inspectionCharacteristicName: [item.inspectionCharacteristicName],
        //             inspectionCharacteristicSingleCriteria: [item.inspectionCharacteristicSingleCriteria],
        //             isMandatory: [item.isMandatory],
        //             qualitativeResultId: [item.qualitativeResultId],
        //             remarks: [item.remarks],
                    
        //         })
        //     );
        // });

        // const staticsData = [
        //     {
        //         inspectionCharacteristicName: 'Color Check',
        //         uoMCode: 'Should be Blue',
        //         isMandatory: true,
        //         target: 12,
        //         max: 3,
        //         min: 5,
        //         quantitativeResult: 'Looks Cool',
        //         remarks: 'Looks good',
        //     },
        //     {
        //         inspectionCharacteristicName: 'Weight Check',
        //         uoMCode: 'Less than 5kg',
        //         isMandatory: false,
        //         target: 12,
        //         max: 3,
        //         min: 5,
        //         quantitativeResult: 'Looks Cool',
        //         remarks: 'Looks good',
        //     },
        // ];

        // this.dataSourceQuantitativeInspection = staticsData;

        // const formsArray = this.evaluationplanQAFormGroup.get(
        //     'quantitativeInspectionResults'
        // ) as FormArray;

        // staticsData.forEach((item) => {
        //     formsArray.push(
        //         this.fb.group({
        //             inspectionCharacteristicName: [item.inspectionCharacteristicName],
        //             uoMCode: [item.uoMCode],
        //             isMandatory: [item.isMandatory],
        //             target: [item.target],
        //             max: [item.max],
        //             min: [item.min],
        //             quantitativeResult: [item.quantitativeResult],
        //             remarks: [item.remarks],
        //         })
        //     );
        // });
    }

   // Get form array controls
   get qualitativeInspectionObjects(): FormArray {
    return this.evaluationplanQAFormGroup.get('qualitativeInspectionObjects') as FormArray;
  }
  
  get quantitativeInspectionResults(): FormArray {
    return this.evaluationplanQAFormGroup.get('quantitativeInspectionResults') as FormArray;
  }
  

    get cavitiesArray(): FormArray {
        return this.evaluationplanQAFormGroup.get('cavities') as FormArray;
    }

    generateCavitiesX(): void {
        const formData = this.evaluationplanQAFormGroup.value;
      
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

        this._evaluationProductionOrderService.addProductionQA(payload).subscribe(
          (response) => {
            if (response?.isRequestSuccess) {
                const  itemCodeForQAid =   this.evaluationplanQAFormGroup.get('itemCode')?.value;
                const  docNumForQAid =   this.evaluationplanQAFormGroup.get('docNum')?.value;
                if (itemCodeForQAid && docNumForQAid) {
                    this.getProductionByQACode(itemCodeForQAid, docNumForQAid);
                  } else {
                    console.warn('API CALLED FAILED. FAIL TO FETCH PO QA ID', {
                    });
                  }

              this._snackBar.open('Production QA added successfully!', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-success']
              });
   
      
              // 🛠 Generate cavities after saving
              this.cavitiesArray.clear();
              const numberOfCavities = this.evaluationplanQAFormGroup.get('cavityNo')?.value;
      
              for (let i = 0; i < numberOfCavities; i++) {
                this.cavitiesArray.push(
                  this._formBuilder.group({
                    cName: `Cavity ${i + 1}`,
                    InspectionTime: '10:30 AM',
                    inspectionBy: 'Mr.Kamran',
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

      generateCavities(): void {
        const formData = this.evaluationplanQAFormGroup.value;
      
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
          inspectionObjects,
          ...payload
        } = formData;
      
        console.log('SENDING Production QA PAYLOAD:', payload);
      
        if (payload.openQuantity) {
          payload.openQuantity = parseFloat(parseFloat(payload.openQuantity).toFixed(2));
        }
      
        this._evaluationProductionOrderService.addProductionQA(payload).subscribe({
          next: (response) => {
            if (response?.isRequestSuccess) {
              const itemCode = this.evaluationplanQAFormGroup.get('itemCode')?.value;
              const docNum = this.evaluationplanQAFormGroup.get('docNum')?.value;
      
              if (itemCode && docNum) {
                this._evaluationPlanQAOrderService.GetProductionQAId(itemCode, docNum).subscribe({
                  next: (qaResponse) => {
                    const qaId = qaResponse?.data?.id;
                    const cavityNum = qaResponse?.data?.cavityNo;
                    const mouldNo = qaResponse?.data?.mouldNo;
      
                    if (qaId && cavityNum) {
                      this._snackBar.open('Production QA added successfully!', 'Close', {
                        duration: 3000,
                        panelClass: ['snackbar-success']
                      });
      
                      // ✅ New: Create all cavities in backend (single call)
                      const cavityBulkPayload = {
                        qaId,
                        mouldNo,
                        cavityNum,
                        isToggledOn: false,
                        name: 'Cavity - '                      };
      
                      this._evaluationProductionOrderService.addProductionCavityQA(cavityBulkPayload).subscribe({
                        next: (res) => {
                          console.log('✅ Cavities created:', res);
      
                          // ✅ Fetch created cavities and populate UI
                          this._evaluationProductionOrderService.getAllCavitiesByQaId(qaId).subscribe({
                            next: (cavityListRes) => {
                              const cavitiesFromBackend = cavityListRes?.data || [];
      
                              this.cavitiesArray.clear();
      
                              cavitiesFromBackend.forEach((cav) => {
                                this.cavitiesArray.push(
                                  this._formBuilder.group({
                                    id: cav.id,
                                    name: cav.name,
                                    isToggledOn: cav.isToggledOn,
                                    enabled: cav.isToggledOn,
                                    generatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // ⏰ Add this

                                  })
                                );
                              });
                            },
                            error: (err) => {
                              console.error('❌ Error fetching cavities:', err);
                            }
                          });
                        },
                        error: (err) => {
                          console.error('❌ Failed to create cavities:', err);
                        }
                      });
                    }
                  },
                  error: (err) => {
                    console.error('❌ Failed to fetch QA ID:', err);
                  }
                });
              } else {
                console.warn('⚠️ itemCode or docNum is missing.');
              }
            }
          },
          error: (error) => {
            console.error('❌ Error adding Production QA:', error);
            this._snackBar.open('Error saving Production QA.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
      

      
      
      

    onEvaluationPlanQaModalX(cav: any, index: any): void {
        if (!cav.enabled) return;
        alert('CAVITY ID' + cav.id);
        console.log('Cavity:', cav);

        const cavityNumber = `Cavity ${index + 1}`;

        console.log('Modal Open:', cav);
        console.log('Opening modal for:', cavityNumber);

        this.selectedCavityName = cavityNumber;
        this.selectedCavity = cav; // ✅ store the cavity object here


        console.log('Opening modal for:', this.selectedCavityName);

        const dialogRef = this._dialog.open(this.dialogTemplateItems, {
            width: '70%',
            height: '75vh',
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.closeDialog();
        });
    }

    onEvaluationPlanQaModal(cav: any, index: any): void {
        if (!cav.enabled) return;
      
        alert('CAVITY ID: ' + cav.id);
        console.log('Cavity:', cav);
      
        const cavityNumber = `Cavity ${index + 1}`;
        this.selectedCavityName = cavityNumber;
        this.selectedCavity = cav;
      
        // ✅ Call API to get full cavity details
        this._evaluationPlanQaOrderService.GetProductionQACavityById(cav.id).subscribe({
          next: (res) => {
            const data = res?.data;
            if (data?.id) {
              this.selectedCavityId = data.id;
              console.log('Cavity Data Loaded:', data);
              alert(`Loaded Cavity ID: ${this.selectedCavityId}`);
            }
          },
          error: (err) => {
            console.error('Error fetching cavity data', err);
          }
        });
      
        // ✅ Open modal
        const dialogRef = this._dialog.open(this.dialogTemplateItems, {
          width: '70%',
          height: '75vh',
        });
      
        dialogRef.afterClosed().subscribe((result) => {
          this.closeDialog();
        });
      }

    onCavitySampleQaModal(rowIndex: any): void {
        // console.log('Row Index:', rowIndex);
        // this.selectedControlAccountRowIndex = rowIndex;
        // console.log(this.selectedControlAccountRowIndex);
        this.selectedRowIndex = rowIndex;

        const dialogRef = this._dialog.open(this.dialogQaTemplateItems, {
          width: '70%',
          height: '75vh',
          data: this.cardCode,
        });

        this.dialogRefs[rowIndex] = dialogRef; 
        
        // DYNAMICALLY ADD Validators.required TO inspectionBy
        const inspectionByControl = this.evaluationplanQAFormGroup.get('inspectionBy');
        if (inspectionByControl) {
          inspectionByControl.setValidators(Validators.required);
          inspectionByControl.updateValueAndValidity(); // Re-validate the control
        }
    
        this.getCardByItemCode(this.selectedOrder.itemCode);
        console.log(this.selectedOrder, 'this.selectedOrder')
        this.getProductionByQACode(
          this.selectedOrder.itemCode,
          this.selectedOrder.docNo,
        )
      }

      getProductionByQACode(itemCode: string, docNum: string) {
        this._evaluationPlanQAOrderService.GetProductionQAId(itemCode, docNum).subscribe({
          next: (response) => {
            const id = response?.data?.id;
      
            if (id) {
              this.productionQAId = id; // Store or use the ID
              console.log('Fetched QA ID:', id);
      
              // Optionally patch form or trigger next API using this ID
              this.evaluationplanQAFormGroup.patchValue({
                inspectionDateTime: response?.data?.inspectionDateTime || new Date().toISOString()
                // cavityId: 'f84cb7e5-486c-4513-89ad-547aaea2cbee' // ✅ hardcoded cavity ID

              });
      
              // Example: this.loadQuantitativeInspection(id);
            } else {
              console.warn('No ID found in response data.');
            }
          },
          error: (err) => {
            console.error('QC SERVICE ERROR:', err);
          }
        });
      }
      XgetProductionByQACode(itemCode: string, docNum: string) {
        this._evaluationPlanQAOrderService.GetProductionQAId(itemCode, docNum).subscribe({
          next: (response) => {
            this.productionQAId = response.data;
            this.evaluationplanQAFormGroup.patchValue({
              // inspectionBy: response.inspectionBy || '', 
              inspectionDateTime: response.inspectionDateTime || new Date().toISOString()
            });
          },
          error: (err) => {
            console.error('QC SERVICE ERROR:', err);
          }
        });
      }


      saveAndCloseQa(): void {
        if (!this.productionQAId) {
          console.error('Production QA ID IS MISSING, CANNOT PROCEED!');
          return;
        }
      
        const inspectionBy = this.evaluationplanQAFormGroup.get('inspectionBy')?.value || 'N/A';
      
        const qualitativeInspections = this.qualitativeInspectionObjects.value.map((item: any) => {
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
      
        const quantitativeInspections = this.quantitativeInspectionResults.value.map((item: any) => {
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
      
        const inspectionObjects = [...qualitativeInspections, ...quantitativeInspections];
      
        const hasPassingQualitative = inspectionObjects
          .filter((i: any) => i.qualitativeResultId !== null)
          .every((i: any) => i.isQualitativeResultPassed === true);
      
        const hasPassingQuantitative = inspectionObjects
          .filter((i: any) => i.quantitativeInspectionMappingId !== null)
          .every((i: any) => i.isQuantitativeResultPassed === true);
      
        const isSamplePassed = hasPassingQualitative && hasPassingQuantitative;
      
        const payload = {
          name: `Sample-${this.samples.length + 1}`,
          inspectionDateTime: new Date().toISOString(),
          inspectionBy,
        //   cavityId: this.productionQAId.id, // ✅ corrected key
            cavityId: this.selectedCavityId, // ✅ this will now be dynamic
            isSamplePassed,
          inspectionObjects
        };
      console.log('SENDING Production QA Sample PAYLOAD lolll:', payload);
        this._evaluationPlanQAOrderService.addProductionQACavitySample(payload).subscribe({
          next: (response) => {
            this._snackBar.open(
              `Sample added successfully with status ${isSamplePassed ? 'Passed' : 'Failed'}`,
              'Close',
              { duration: 3000, panelClass: ['snackbar-success'] }
            );
            console.log('SENDING Production QA Sample PAYLOAD HAHAH:', payload);

      
            const newSample = {
              title: payload.name,
              inspectionTime: new Date(payload.inspectionDateTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              inspectionBy: payload.inspectionBy,
              cavityId: payload.cavityId, // ✅ ADD THIS LINE
              cardColor: isSamplePassed ? 'lightgreen' : 'lightcoral',
            };
      
      // ✅ Store sample by cavityId
      if (!this.samplesByCavity[payload.cavityId]) {
        this.samplesByCavity[payload.cavityId] = [];
      }
      this.samplesByCavity[payload.cavityId].push(newSample);      
            this.qualitativeInspectionObjects.clear();
            this.quantitativeInspectionResults.clear();
      
            // ✅ moved here
            // this._evaluationPlanQAOrderService.getIsSamplePassedListByProdQACavityId(this.productionQAId.id).subscribe({
            //   next: (isSamplePassedList: boolean[]) => {
            //     console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);
            //     this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
            //     console.log('SAMPLES STATUS ~ this.samplesStatus:', this.samplesStatus);
      
            //     this.evaluationplanQAFormGroup.patchValue({
            //       samplesStatus: this.samplesStatus
            //     });
            //   },
            //   error: (error) => {
            //     console.error('getIsSamplePassedListByProdQAId API Error:', error);
            //     this._snackBar.open('Failed to fetch samples against this Production Order QA .', 'Close', {
            //       duration: 3000,
            //       panelClass: ['snackbar-error']
            //     });
            //   }
            // });
      
            this.closeQaManually();
          },
          error: (err) => {
            console.error('Failed to add QA Sample:', err);
            this._snackBar.open('Error adding sample.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
      
      
    

    closeDialog(): void {
        this._dialog.closeAll();
    }


    closeQaManually(): void {
      if (this.selectedRowIndex !== null) {
        const dialogRef = this.dialogRefs[this.selectedRowIndex];        
        if (dialogRef) {
          dialogRef.close();
          delete this.dialogRefs[this.selectedRowIndex];
        }
        this.selectedRowIndex = null;
      }
    }

    populateProductionOrderFormQA(data: any): void {
        console.log('Selected Production Order QA:', data);
        this.evaluationplanQAFormGroup.patchValue({
            itemCode: data.itemCode ?? 'N/A',
            itemDescription: data.itemDescription ?? 'N/A',
            inspectionDateTime: new Date().toISOString(), // Add missing field
            docDate: data.docDate,
            docNum: data.docNo.toString(), // Convert to string
            warehouse: data.warehouse,
            openQuantity: data.openQty,
            plannedQuantity: data.qty ?? '-', // ✅ Same as qty
            qcLotNo: data.lotNo ?? 'N/A',
            shift: data.shift ?? 'N/A',
            machineNo: data.machine ?? 'N/A',
            bmrNo: data.bmr ?? 'N/A',
            mouldNo: data.mold ?? 'N/A',
            cavityNo: data.cavity ?? 'N/A', // ✅ Convert safely
            cycleTime: data.cycleTime ?? 'N/A', // ✅ Convert safely
            itemWeight: data.weight !== undefined ? data.weight.toString() : 'N/A', // ✅ Convert safely
            variant: data.variant ?? 'N/A',
            // analyzedBy: data.analyzedBy ?? '', // ✅ Ensure empty string if not provided
            status: data.status ?? 'Ali', // ✅ Ensure default value
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

    populateQualitativeAndQuantitativeData(data: any) {
        const qualitativeArray = this.evaluationplanQAFormGroup.get('qualitativeInspectionObjects') as FormArray;
        const quantitativeArray = this.evaluationplanQAFormGroup.get('quantitativeInspectionResults') as FormArray;
    
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
      
    getItemId(itemCode: any): void {
      this._evaluationPlanQAOrderService.GetItemIdByCode(itemCode).subscribe({
        next: (response) => {
          if (response && response.data && response.data.length > 0) {
            const itemId = response.data[0].id;
            this.evaluationplanQAFormGroup.get('itemId')?.setValue(itemId);
          }
        },
        error: (err) => {
          console.error('SERVICE ERROR:', err);
        }
      });
    }

    getCardByItemCode(itemCode: string) {
        this._evaluationPlanQAOrderService.getItemCode(itemCode).subscribe({
          next: (response) => {
            this.cardCode = response.data;
            console.log(this.cardCode);
            if (this.cardCode) {
              // this.planPurchaseOrderFormGroup.patchValue({
              //   itemCode: this.cardCode.itemId || '',
              //   itemDescription: this.cardCode.itemDescription || ''
              // });
              this.populateQualitativeAndQuantitativeData(this.cardCode);
            }
          },
          error: (err) => {
            console.error('SERVICE ERROR:', err);
          }
        });
    }


      

    
}
