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
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { Router } from '@angular/router';




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
    orderType: string = ''; // Variable to hold the order type
    selectedSample: any;
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

    samples = [];

    // dataSourceQualitativeInspection: any[] = [];
    // dataSourceQuantitativeInspection: any[] = [];
    selectedCavityName: string = '';
    cavityList: any;
    selectedCavitySamples: any;

    constructor(
        private _evaluationPlanQaOrderService: EvaluationPlanQaOrderService,
        private _evaluationPlanQAOrderService:  EvaluationPlanQaOrderService,
        private _evaluationProductionOrderService: EvaluationPlanQaOrderService,
        private _qbsConfirmationService: QbsConfirmationService,
        private router: Router,
        private _snackBar: MatSnackBar,
        private _formBuilder: FormBuilder,
        private fb: FormBuilder,
        private _dialog: MatDialog
    ) {}

    cavityNo = [];

    evaluationplanQAFormGroup = this._formBuilder.group({

        id: [''],
        intCode: [''],
        docNum: [''],
        itemCode: [''],
        itemDescription: [''],
        inspectionDateTime: [new Date().toISOString()],
        // prodOrder: [''],
        qcLotNo: [''], 
        docDate: [], 
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
        inspectionQuantity: [], 
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
        isClosed: [false],
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
        this.isEditMode = history.state.from === 'evaluationPlan'; // Set edit mode if coming from Evaluation Plan
        this.orderType = history.state.orderType; // Get the order type
    
        if (this.selectedOrder) {
            console.log('Selected Order Data:', this.selectedOrder);
            
            // Always get item ID regardless of mode
            this.getItemId(this.selectedOrder.itemCode);
            
            // Only call one population method based on mode
            if (this.isEditMode) {
                // Edit mode - use the edit population method
                console.log('EDIT MODE: Production Order Form', this.selectedOrder);
                this.populateEditProductionOrderFormQA(this.selectedOrder);
                this.getCavityListByQaId(this.selectedOrder.id);
                // this.getCavityDetailsById(this.selectedOrder.cavityId);

                // If needed, load related samples based on orderType
                if (this.orderType === 'productionOrderQA') {
                    // this.ListAllProductionQASamplesByQaId(this.selectedOrder.id);
                    this.getCavityListByQaId(this.selectedOrder.id);

                } else {
                    // this.ListAllProductionQCSamplesByQcId(this.selectedOrder.id);
                }
            } else {
                // Create mode - use the create population method
                console.log('CREATE MODE: Production Order Form', this.selectedOrder);
                this.populateProductionOrderFormQA(this.selectedOrder);
            }
        }

        if (!this.isEditMode) {
          this._evaluationPlanQaOrderService.getProductionQACode().subscribe((productionQACode) => {
            console.log('Production QC Code:', productionQACode); // Debugging ke liye

            const intCodeNumber = productionQACode.data?.toString() ?? '';
            let formattedIntCode = intCodeNumber;
            if (formattedIntCode.length < 5) {
              formattedIntCode = formattedIntCode.padStart(5, '0');
            }
            const formattedIntCodePlanProduction = `PRDQA-${formattedIntCode}`;
            this.evaluationplanQAFormGroup.get('intCode')?.setValue(formattedIntCodePlanProduction);

            // const fullCode = `PQA-000${productionQACode.data || ''}`; // Code format
            // this.evaluationplanQAFormGroup.get('intCode')?.setValue(fullCode); // Yahan correct form group use karo
          });
        }
    
        this.dataSourceQualitativeInspection = new MatTableDataSource(this.qualitativeInspectionObjects.controls);
        this.dataSourceQuantitativeInspection = new MatTableDataSource(this.quantitativeInspectionResults.controls);
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
                        isToggledOn: true,
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

      generateCavities(): void {
        const formData = this.evaluationplanQAFormGroup.value;
      
        const {
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
      
        if (payload.openQuantity) {
          payload.openQuantity = parseFloat(parseFloat(payload.openQuantity).toFixed(2));
        }
      
        // ⛔ QC status check BEFORE adding QA
        this._evaluationProductionOrderService.getQualityStatusQAProduction('production_qa', itemCode, formData.docNum)
          .subscribe({
            next: (qualityResponse) => {
              console.log('Quality Response:', qualityResponse);
              if (qualityResponse?.data?.isClosed !== true) {
                this._snackBar.open('QA already open for this item. Cannot submit again.', 'Close', {
                  duration: 3000,
                  panelClass: ['snackbar-error']
                });
                return; // ⛔ Stop further execution
              }
      
              // ✅ Proceed to add QA
              console.log('Proceeding to call addProductionQA...');

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
      
                            const cavityBulkPayload = {
                              qaId,
                              mouldNo,
                              cavityNum,
                              isToggledOn: true,
                              name: 'Cavity - '
                            };
      
                            this._evaluationProductionOrderService.addProductionCavityQA(cavityBulkPayload).subscribe({
                              next: (res) => {
                                console.log('✅ Cavities created:', res);
      
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
                                          generatedTime: new Date().toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })
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
            },
            error: (error) => {
              console.error('❌ Error checking QC status:', error);
              this._snackBar.open('Error checking QC status.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
              });
            }
          });
      }
      


    onEvaluationPlanQaModal(cav: any, index: number): void {
        if (!cav.enabled) return;
        this.samplesByCavity = {}; // or just delete specific entry if needed

        // alert('CAVITY ID: ' + cav.id);
        console.log('Cavity:', cav);
      
        // const cavityNumber = `Cavity ${index + 1}`;
        // this.selectedCavityName = cavityNumber;
        this.selectedCavityName = cav.name;
      
        // ✅ Call API to get full cavity details
        this._evaluationPlanQaOrderService.GetProductionQACavityById(cav.id).subscribe({
          next: (res) => {
            const data = res?.data;
            if (data?.id) {
              this.selectedCavityId = data.id;
              console.log('Cavity Data Loaded:', data);
              // alert(`Loaded Cavity ID: ${this.selectedCavityId}`);
            }
          },
          error: (err) => {
            console.error('Error fetching cavity data', err);
          }
        });
      
            // ✅ Call the `getAllProductionQASamplesByCavityId` API for samples when editing
        this._evaluationPlanQaOrderService.getAllProductionQASamplesByCavityId(cav.id).subscribe({
          next: (sampleRes) => {
            const samples = sampleRes?.data || [];

            // Save samples only if they exist
            if (samples.length > 0) {
              const enhancedSamples = samples.map(sample => ({
                ...sample,
                cardColor: sample.isSamplePassed ? 'lightgreen' : 'lightcoral',
                inspectionTime: new Date(sample.inspectionDateTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }));
              this.samplesByCavity[cav.id] = enhancedSamples;
              this.selectedCavityId = cav.id; // ✅ Set it *after* assigning data              console.log('Samples for Cavity (Enhanced):', enhancedSamples);
            } else {
              console.log('No samples found for this cavity.'); // Just log silently
            }
          },
          error: (err) => {
            console.error('Error fetching cavity samples:', err);
            this._snackBar.open('No Samples found in this cavity', 'Close', {
              duration: 3000,
            });
          }
        });
        // ✅ Open modal
        const dialogRef = this._dialog.open(this.dialogTemplateItems, {
          width: '70%',
          height: '75vh',
        });
      
        dialogRef.afterClosed().subscribe(() => {
          this.closeDialog();
            // ✅ Clear the samples for the currently selected cavity
  if (this.selectedCavityId) {
    this.samplesByCavity[this.selectedCavityId] = [];
  }

  // ✅ Optionally clear selectedCavityId too
  this.selectedCavityId = null;
        });
      }
      
      

    onCavitySampleQaModal(rowIndex: any, sample?: any): void {
      this.isEditMode = false; // ✅ Reset flag for new sample
      this.selectedRowIndex = rowIndex;
      this.selectedSample = sample; // Save selected sample
      this.qualitativeInspectionObjects.clear();
      this.quantitativeInspectionResults.clear();

        // console.log('Row Index:', rowIndex);
        // this.selectedControlAccountRowIndex = rowIndex;
        // console.log(this.selectedControlAccountRowIndex);

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
        const currentSamples = this.samplesByCavity[this.selectedCavityId] || [];

      
        const payload = {
          name: `Sample-${currentSamples.length + 1}`,
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
              id: response?.id || '', // ✅ Add this
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
            this._evaluationPlanQAOrderService.getIsSamplePassedListByProdQACavityId(this.productionQAId.id).subscribe({
              next: (isSamplePassedList: boolean[]) => {
                console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);
                this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
                console.log('SAMPLES STATUS ~ this.samplesStatus:', this.samplesStatus);
      
                this.evaluationplanQAFormGroup.patchValue({
                  samplesStatus: this.samplesStatus
                });
              },
              error: (error) => {
                console.error('getIsSamplePassedListByProdQAId API Error:', error);
                // this._snackBar.open('Failed to fetch samples against this Production Order QA .', 'Close', {
                //   duration: 3000,
                //   panelClass: ['snackbar-error']
                // });
              }
            });

                // ✅ Add the new API call here to get all samples by cavity ID
      this._evaluationPlanQAOrderService.getAllProductionQASamplesByCavityId(this.selectedCavityId).subscribe({
        next: (response) => {
          console.log('All cavity samples fetched successfully:', response);
          // You can do additional processing with the response here if needed
        },
        error: (err) => {
          console.error('Failed to fetch all cavity samples:', err);
          this._snackBar.open('Error fetching all cavity samples.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });

      
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
    // FORMATTING intCode
    const rowIntCode = data.intCode ?? '';
    // const formattedIntCode = `PQA-${rowIntCode.toString().padStart(7, '0')}`;
    let formattedIntCode = rowIntCode.toString();
    if (formattedIntCode.length < 5) {
      formattedIntCode = formattedIntCode.padStart(5, '0');
    }
    const formattedIntCodePlanProductionQA = `PRDQA-${formattedIntCode}`;
    this.evaluationplanQAFormGroup.patchValue({
      // intCode: formattedIntCode ?? "",  // intCode: data.intCode ?? "",
      intCode: formattedIntCodePlanProductionQA,
          analyzedBy: data.analyzedBy ?? 'N/A',
          mouldNo: data.mouldNo ?? 'N/A',
          machineNo: data.machineNo ?? 'N/A',
          docDate: data.docDate ? new Date(data.docDate).toISOString().split('T')[0] : null,
          bmrNo: data.bmrNo ?? 'N/A',
          itemWeight: data.itemWeight ?? 'N/A',
          openQuantity: data.openQuantity ?? 0,
          qcLotNo: data.qcLotNo ?? 'N/A',
          itemCode: data.itemCode ?? 'N/A',
          itemDescription: data.itemDescription ?? 'N/A',
          docNum: data.docNo.toString(), // Convert to string
          warehouse: data.warehouse ?? 'N/A',
          variant: data.variant ?? 'N/A',
          cycleTime: data.cycleTime ?? 'N/A',
          shift: data.shift ?? 'N/A',
          cavityNo: data.cavity ?? 'N/A',
          plannedQuantity: data.plannedQuantity ?? 0,
          id: data.id,
          inspectionQuantity: data.inspectionQuantity,
          isClosed: data.isClosed === true ? true : false,

          
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

    getCavityListByQaId(qaId: string): void {
      this._evaluationPlanQAOrderService
        .getAllProductionQACavitiesByQaId(qaId)
        .subscribe({
          next: (response) => {
            console.log('🟢 Cavity List fetched:', response);
    
            const cavityData = response.data || [];  // Ensure it's an array
    
            const cavityFormGroups = cavityData.map(cavity => this.fb.group({
              id: [cavity.id],
              name: [cavity.name],
              generatedTime: [this.formatTime(cavity.createdDate)],
              enabled: [true],
              isToggledOn: [cavity.isToggledOn]
            }));
    
            const cavityFormArray = this.fb.array(cavityFormGroups);
            this.evaluationplanQAFormGroup.setControl('cavities', cavityFormArray);
    
            console.log("✅ cavities FormArray populated", cavityFormArray);
          },
          error: (err) => {
            console.error('🔴 Error fetching cavity list:', err);
          },
        });
    }

    formatTime(isoString: string): string {
      const date = new Date(isoString);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      
      return `${hours}:${strMinutes} ${ampm}`;
    }

    getCavityDetailsById(cavityId: string): void {
      this._evaluationPlanQAOrderService.getProductionQACavityById(cavityId).subscribe({
        next: (res) => {
          this.selectedCavity = res.data;
          console.log('✅ Cavity Details Loaded:', this.selectedCavity);
        },
        error: (err) => {
          console.error('❌ Error Loading Cavity Details:', err);
          // this._toastr.error('Failed to load cavity details');
        }
      });
    }


    toggleCavity(event: MatSlideToggleChange, index: number, cav: any): void {
      const newToggleValue = event.checked;
    
      const cavity = this.cavitiesArray.at(index);
      cavity.get('enabled')?.setValue(newToggleValue);
    
      const payload = {
        id: cav.id,
        name: cav.name,
        inspectionBy: cav.inspectionBy ?? null,
        inspectionDateTime: cav.inspectionDateTime ?? null,
        isActive: cav.isActive ?? true,
        isCavityPassed: cav.isCavityPassed ?? null,
        mouldNo: cav.mouldNo ?? '',
        isToggledOn: newToggleValue
      };
    
      this._evaluationPlanQaOrderService.updateProductionQACavity(payload).subscribe({
        next: (res) => {
          console.log('Toggle API Success:', res);
    
          // ✅ Refresh the latest toggle state from server
          this._evaluationPlanQaOrderService.GetProductionQACavityById(cav.id).subscribe({
            next: (refreshRes) => {
              const updatedCavity = refreshRes?.data;
              if (updatedCavity) {
                // Update the form group with latest value
                cavity.patchValue({
                  ...updatedCavity
                });
                console.log('Refreshed Cavity State:', updatedCavity);
              }
            },
            error: (err) => {
              console.warn('Failed to fetch updated cavity state', err);
            }
          });
        },
        error: (err) => {
          console.error('Toggle API Error:', err);
          this._snackBar.open('Failed to update cavity toggle.', 'Close', {
            duration: 3000,
          });
          cavity.get('enabled')?.setValue(!newToggleValue); // revert UI on error
        }
      });
    }

    onEditCavitySample(sample: any, index: number): void {
      this.isEditMode = true; // ✅ Set to true on edit
      this.selectedRowIndex = index; // ✅ Set this!
      this.selectedSample = sample; // set this when "Edit" is clicked
      console.log('Sample ID:', sample.id); // ✅ Log it here

      console.log('Editing Sample:', sample);
      const dialogRef = this._dialog.open(this.dialogQaTemplateItems, {
        width: '70%',
        height: '75vh',
        data: {
          cardCode: this.cardCode,
          sample: sample,
        },
      });
    
      this.dialogRefs[this.selectedRowIndex] = dialogRef;
    
      // Populate form fields using sample
      this.evaluationplanQAFormGroup.patchValue({
        inspectionBy: sample.inspectionBy,
        // inspectionTime: sample.inspectionTime,
        // other fields...
      });
    
      // Call these AFTER patching values
      this.getCardByItemCode(this.selectedOrder.itemCode);
      this.getProductionByQACode(
        this.selectedOrder.itemCode,
        this.selectedOrder.docNo
      );
    }

    updateSampleCavity(sampleId: string): void {
      console.log('Debug - productionQAId:', this.productionQAId);
      console.log('Debug - sampleId received:', sampleId);
      if (!this.productionQAId || !sampleId) {
        console.error('Production QA ID or Sample ID is missing, cannot proceed!');
        return;
      }
    
      const inspectionBy = this.evaluationplanQAFormGroup.get('inspectionBy')?.value || 'N/A';
    
      const qualitativeInspections = this.qualitativeInspectionObjects.value.map((item: any) => {
        const selectedStatus = item?.qualitativeResultPassStatusResults?.find(
          (status: any) => status.qualitativeResultId === item.qualitativeResultId
        );
        return {
          id: item?.id || null, // Add the ID if available for update
          qualitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || "",
          quantitativeInspectionMappingId: null,
          qualitativeResultId: item?.qualitativeResultId || null,
          isQualitativeResultPassed: selectedStatus ? selectedStatus.isPassed : false,
          quantitativeResult: 0,
          isQuantitativeResultPassed: false,
          remarks: item?.remarks || "",
          isActive: true
        };
      }) || [];
    
      const quantitativeInspections = this.quantitativeInspectionResults.value.map((item: any) => {
        const resultValue = item?.result ? parseFloat(item.result) : 0;
        return {
          id: item?.id || null, // Add the ID if available for update
          qualitativeInspectionMappingId: null,
          quantitativeInspectionMappingId: item?.inspectionCharacterisicMappingId || null,
          qualitativeResultId: null,
          isQualitativeResultPassed: false,
          quantitativeResult: resultValue,
          isQuantitativeResultPassed: !isNaN(resultValue) &&
            resultValue >= (item.min ?? 0) &&
            resultValue <= (item.max ?? 0),
          remarks: item?.remarks || "",
          isActive: true
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
      
      // Find the current sample to be updated
      const currentSample = this.samplesByCavity[this.selectedCavityId]?.find(sample => sample.id === sampleId);
      
      const payload = {
        id: sampleId,
        name: currentSample?.title || `Sample-Updated`,
        inspectionDateTime: new Date().toISOString(),
        inspectionBy,
        productionQcId: this.productionQAId.id, // Using productionQcId as mentioned in your API schema
        isSamplePassed,
        isActive: true,
        inspectionObjects
      };
      
      console.log('SENDING Production QA Sample UPDATE PAYLOAD:', payload);
      
      this._evaluationPlanQAOrderService.updateProductionQACavitySample(payload).subscribe({
        next: (response) => {
          this._snackBar.open(
            `Sample updated successfully with status ${isSamplePassed ? 'Passed' : 'Failed'}`,
            'Close',
            { duration: 3000, panelClass: ['snackbar-success'] }
          );
          
          // Update the sample in the UI
          if (this.samplesByCavity[this.selectedCavityId]) {
            const index = this.samplesByCavity[this.selectedCavityId].findIndex(sample => sample.id === sampleId);
            if (index !== -1) {

                  // 🔍 Add these logs here to verify
    console.log('Update Color Check ~ isSamplePassed:', isSamplePassed);
    console.log('payload.isSamplePassed:', payload.isSamplePassed);
              this.samplesByCavity[this.selectedCavityId][index] = {
                ...this.samplesByCavity[this.selectedCavityId][index],
                inspectionTime: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                inspectionBy: payload.inspectionBy,
                cardColor: isSamplePassed ? 'lightgreen' : 'lightcoral',
              };
            }
          }
          
          // Reset form fields if needed
          this.qualitativeInspectionObjects.clear();
          this.quantitativeInspectionResults.clear();
          
          // Update samples status
          this._evaluationPlanQAOrderService.getIsSamplePassedListByProdQACavityId(this.productionQAId.id).subscribe({
            next: (isSamplePassedList: boolean[]) => {
              console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);
              this.samplesStatus = isSamplePassedList.length > 0 && isSamplePassedList.every(status => status === true);
              console.log('SAMPLES STATUS ~ this.samplesStatus:', this.samplesStatus);
              
              this.evaluationplanQAFormGroup.patchValue({
                samplesStatus: this.samplesStatus
              });
            },
            error: (error) => {
              console.error('getIsSamplePassedListByProdQAId API Error:', error);
              this._snackBar.open('Failed to fetch samples against this Production Order QA.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
              });
            }
          });
          
          // Refresh samples by cavity ID
          this._evaluationPlanQAOrderService.getAllProductionQASamplesByCavityId(this.selectedCavityId).subscribe({
            next: (response) => {
              console.log('All cavity samples fetched successfully after update:', response);
                  // ✅ ADD THIS to assign color based on isSamplePassed
    const samplesWithColor = response.data.map((sample: any) => ({
      ...sample,
      cardColor: sample.isSamplePassed ? 'lightgreen' : 'lightcoral'
    }));

    this.samplesByCavity[this.selectedCavityId] = samplesWithColor;
  
              // You can update your table/UI here with the fresh data if needed
            },
            error: (err) => {
              console.error('Failed to fetch all cavity samples after update:', err);
              this._snackBar.open('Error fetching all cavity samples.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
              });
            }
          });
          
          this.closeQaManually();
        },
        error: (err) => {
          console.error('Failed to update QA Sample:', err);
          this._snackBar.open('Error updating sample.', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
    
    closeOpenQA() {
      const OpenPOqaId = this.evaluationplanQAFormGroup.get('id')?.value;
      if (!OpenPOqaId) {
        console.error('NO VALID PRODUCTION QC ID FOUND AGAINST THIS PO');
        this._snackBar.open('FAILED TO CLOSE. QC ID MISSING.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
        return;
      }
      const payloadToCloseOpenQA = {
        isPerformed: true,
        isPostedToSap: false,
        isClosed: true,
        overallStatus: this.evaluationplanQAFormGroup.get('samplesStatus')?.value,
        id: OpenPOqaId,
        inspectionDateTime: this.evaluationplanQAFormGroup.get('inspectionDateTime')?.value,
        remarks: this.evaluationplanQAFormGroup.get('remarks')?.value || 'Closed due to unknown reasons',
        isActive: true,
        operatedBy: null,
        barcode: null,
        reportReviewDate: null,
        reportNextReviewDate: null,
        reportRemarks: null,
      };
      console.log('PAYLOAD', payloadToCloseOpenQA);
      // FUNCTION TO HANDLE API CALL
      const callCloseQAApi = () => {
        this._evaluationProductionOrderService.updateToCloseOpenQA(payloadToCloseOpenQA).subscribe({
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
      if (payloadToCloseOpenQA.overallStatus === true) {
        const confirmation = this._qbsConfirmationService.open({
          title: 'Close QA',
          message: 'Are you sure you want to close this QA instead of posting to SAP?',
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
            callCloseQAApi();
          }
        });
      } else if (payloadToCloseOpenQA.overallStatus === false) {
        const confirmation = this._qbsConfirmationService.open({
          title: 'Close QA',
          message: 'Are you sure you want to close this QA?',
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
            callCloseQAApi();
          }
        });
      }
    }
    
    
    

      

    
  backTolist() {
    this.router.navigate(['/evaluation-plan/list-of-evaluation-plan']);
  }
}
