import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation, inject, } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { qbsAnimations } from '@qbs/animations';
import { InspectionCardService } from 'app/core/other-core-services/module/inspection-card.service';
import { InspectionCharacteristicsService } from 'app/core/other-core-services/module/inspection-characteristics.service';
import { ItemInspectionCardService } from 'app/core/other-core-services/module/item-inspection-card.service';
import { ItemSamplesService } from 'app/core/other-core-services/module/item-sample.service';
import { QualitativeResultsService } from 'app/core/other-core-services/module/qualitative-results.service';
import { UomMasterService } from 'app/core/other-core-services/module/uom-master.service';
import { qualitativeInspectionIF, quantitativeInspectionIF, } from '../list-of-items-inspection-cards/items-inspection-cards/items-inspection-cards-interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { SAPItemsService } from 'app/core/other-core-services/module/sap-list-all-items.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs'; 



// Item Inspection Card
interface RowData {
    id: string;
    parameter: string;
    passCriteria: string;
    mandatory: boolean;
    pass: string;
    fail: string;
}
interface itemSamplingRangeIF {
    lotSizeMin: number;
    lotSizeMax: number;
    sampleQty: number;
    criticalDefects: number;
    majorDefects: number;
    minorDefects: number;
}

@Component({
    selector: 'app-testing-stepper',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports:
        [
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
            MatProgressSpinnerModule,
        ],
    animations: qbsAnimations,
    templateUrl: './testing-stepper.component.html',
    styleUrl: './testing-stepper.component.scss',
})
export class TestingStepperComponent implements AfterViewInit {
    isEditMode: boolean = false;
    isValidate: boolean = false;
    isLoading: boolean = false;
    rowDataQR: any; // TO STORE RECEIVED QR DATA FROM NAVIGATION
    rowDataUOM: any; // TO STORE RECEIVED UOM DATA FROM NAVIGATION
    rowDataICH: any; // TO STORE RECEIVED ICH DATA FROM NAVIGATION
    rowDataIC: any; // TO STORE RECEIVED IC DATA FROM NAVIGATION
    rowDataIS: any; // TO STORE RECEIVED IS DATA FROM NAVIGATION    -   ITEM SAMPLE
    rowDataIIC: any; // TO STORE RECEIVED IS DATA FROM NAVIGATION    -   ITEM SAMPLE
    initialSamplingRangeObjects: any[] = []; //  DECLARE  TO STORE INITIAL samplingRangeObjects VALUES

    // private _formBuilder = inject(FormBuilder);
    dataSourceItemCodeIS!: MatTableDataSource<any>;
    private _activatedRoute = inject(ActivatedRoute);

    unitOfMeasureLOV: any = [];
    characteristicsList: any[] = [];
    inspectionCardModalList: any[] = [];

    constructor(
        //Form Builder
        private cdr: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private _inspectionCardModal: InspectionCardService,
        private _inspectionCard: InspectionCardService,
        private _inspectionCardUpdate: InspectionCardService,
        private _itemSamplesService: ItemSamplesService,
        private _uommasterservice: UomMasterService,
        private _inspectionCharateristics: InspectionCharacteristicsService,
        private _inspectionCardsCode: InspectionCardService,
        private _qualityResultsCode: QualitativeResultsService,
        private _qualitativeResultsService: QualitativeResultsService,
        private _inspectionCardService: InspectionCardService,
        private _inspectionCardServiceCardID: InspectionCardService,
        private _snackBar: MatSnackBar,
        // Item Inspection Card
        private _itemInspectionCardService: ItemInspectionCardService,
        private _SAPItemsService: SAPItemsService,
        private changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
    ) { }
    qualitativeData = [
        { parameter: 'Sample Parameter 1' }, // Initial row
        { parameter: 'Sample Parameter 2' },
    ];
    displayedColumns: string[] = ['parameter'];
    firstRowAdded: boolean = false;

    @ViewChild(MatStepper) stepper!: MatStepper; // Correctly reference the MatStepper instance
    //Qualitative Results Form
    firstFormGroup = this._formBuilder.group({
        id: [''],
        isActive: [true],
        resultDescription: ['', Validators.required],
        data: [''],
    });
    // Unit Of Measure Form
    secondFormGroup = this._formBuilder.group({
        id: [''],
        uoMCode: ['', Validators.required],
        description: ['', Validators.required],
        isActive: [true],
    });
    // ITEM SAMPLE
    itemSamplingForm = this._formBuilder.group({
        sampleCodeIS: [''],
        itemCode: ['', Validators.required],
        itemId: ['', Validators.required],
        itemDescription: ['', Validators.required],
        flexibility: [true],
        isActive: [true],
        // samplingRangeObjects: this._formBuilder.array([]),
        samplingRangeObjects: this._formBuilder.array([], [Validators.required]),
        id: [''],
    });
    displayedColumnsItemSamplingRange = [
        'lotSizeMin',
        'lotSizeMax',
        'sampleQty',
        'criticalDefects',
        'majorDefects',
        'minorDefects',
    ];
    dataSourceItemSampling = new MatTableDataSource<itemSamplingRangeIF>();
    selectionItemSampling = new SelectionModel<itemSamplingRangeIF>(true, []);

    // dataSourceItemSampling = new MatTableDataSource<itemSamplingIF>();
    // get samples(): FormArray {
    //     return this.itemSamplingForm.get('samples') as FormArray;
    // }

    get samplingRangeObjects(): FormArray {
        return this.itemSamplingForm.get('samplingRangeObjects') as FormArray;
    }

    addNewRowItemSampling(): void {
        const itemSamplingFormGroup = this.fb.group({
            lotSizeMin: [null, [Validators.required, Validators.min(1)]],
            lotSizeMax: [null, [Validators.required, Validators.min(1)]],
            sampleQty: [null, [Validators.required, Validators.min(1)]],
            criticalDefects: [null],
            majorDefects: [null],
            minorDefects: [null],
        });
        // this.samples.push(itemSamplingFormGroup); // Add a new FormGroup to FormArray
        // this.dataSourceItemSampling.data = [...this.samples.value]; // Update the table data source
        this.samplingRangeObjects.push(itemSamplingFormGroup); // Add a new FormGroup to FormArray
        this.dataSourceItemSampling.data = [...this.samplingRangeObjects.value]; // Update the table data source
    }

    // ITEM SAMPLE ITEM CODE NG TEMPLATE STARTS
    @ViewChild('dialogTemplateItemCodeIS') dialogTemplateItemCodeIS;
    onItemSampleItemCodeClick() {
        this.fetchListAllItems();
        const dialogRef = this.dialog.open(this.dialogTemplateItemCodeIS, {
            width: '75vw',
            height: '75vh',
            data: this.dataSourceItemCodeIS,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsItemCodeIS: string[] = [
        'itemCode',
        'itemDescription',
        'itemGroup',
    ];
    selectedIntCodeIS: number;
    selectedItemCodeIS: string;
    selectedItemIdIS: string;
    selectedItemDescriptionIS: string = '';
    //
    onRowCheckboxChangeItemCodeIS(selectedRow: any): void {
        this.dataSourceItemCodeIS.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }
    //
    addSelectedRowItemCodeIS(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceItemCodeIS.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            this.itemSamplingForm.get('itemCode').setValue(selectedRow.itemCode);
            this.itemSamplingForm.get('itemId').setValue(selectedRow.id);
            this.itemSamplingForm.get('itemDescription').setValue(selectedRow.name);

            this.selectedIntCodeIS = selectedRow.intCode;
            this.selectedItemIdIS = selectedRow.id;
            this.selectedItemCodeIS = selectedRow.itemCode;
            this.selectedItemDescriptionIS = selectedRow.name;

            console.log('SELECTED ROW:', selectedRow);
        } else {
            console.log('NO ROW SELECTED');
        }
    }

    applyFilterItemSampleCode(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceItemCodeIS.filter = filterValue.trim().toLowerCase();
    }
    // ITEM SAMPLE ITEM CODE NG TEMPLATE ENDS

    // ITEM SAMPLE ITEM CODE NG TEMPLATE STARTS
    @ViewChild('dialogTemplateItemSampleItems') dialogTemplateItemSampleItems;
    // dataSourceItemSampleCode!: MatTableDataSource<any>;
    dataSourceItemSampleCode = new MatTableDataSource([
        {
            itemId: 1,
            itemCode: 'ITM0012561',
            itemDescription: 'Paint Bucket 3KG',
            itemGroup: 'Item Group A',
            isSelected: false,
        },
        {
            itemId: 2,
            itemCode: 'ITM001   2562',
            itemDescription: 'Paint Bucket 5KG',
            itemGroup: '',
            isSelected: false,
        },
    ]);
    //
    onItemSampleItemCodeClickx() {
        const dialogRef = this.dialog.open(this.dialogTemplateItemSampleItems, {
            width: '75vw',
            height: '75vh',
            data: this.dataSourceItemSampleCode,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsItemSampleCode: string[] = [
        'itemCode',
        'itemDescription',
        'itemGroup',
    ];
    selectedItemSampleCode: string = '';
    selectedItemSampleDescription: string = '';
    //
    onRowCheckboxChangeItemSampleCode(selectedRow: any): void {
        this.dataSourceItemSampleCode.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }
    //
    addSelectedRowItemSampleCode(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceItemSampleCode.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            this.itemSamplingForm
                .get('itemCode')
                .setValue(selectedRow.itemCode);
            this.itemSamplingForm
                .get('itemDescription')
                .setValue(selectedRow.itemDescription);
            this.selectedItemSampleCode = selectedRow.itemCode;
            this.selectedItemSampleDescription = selectedRow.itemDescription;
            console.log('SELECTED ROW:', selectedRow);
        } else {
            console.log('NO ROW SELECTED');
        }
    }
    //
    applyFilterItemSampleCodex(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceItemSampleCode.filter = filterValue.trim().toLowerCase();
    }
    // ITEM SAMPLE ITEM CODE NG TEMPLATE ENDS

    //
    fourthFormGroup = this._formBuilder.group({
        id: [''],
        intCode: [''],
        description: ['', Validators.required],
        isActive: [true],
        type: ['qualitative', Validators.required],
        singleCriteria: [''],
        qualitativeCriteriaObjects: this._formBuilder.array([]),
    });
    fifthFormGroup = this._formBuilder.group({
        id: [''],
        intCode: ['', Validators.required],
        description: ['', Validators.required],
        isActive: [true],
        // type: ['', Validators.required],
        qualitativeTableCriteria: this._formBuilder.array(
            [] as { parameter: string }[]
        ),
        quantitativeTableCriteria: this._formBuilder.array(
            [] as { parameterX: string }[]
        ),
    });

    // ITEM INSPECTION CARD STARTS
    // itemsInspectionCardsForm: FormGroup;
    itemsInspectionCardsForm = this._formBuilder.group({
        // ITEMS
        itemName: ['', Validators.required],
        itemType: ['', Validators.required],
        itemGroupCode: ['', Validators.required],
        itemU_QACard: [null],
        itemUoMGroupEntry: ['', Validators.required],
        itemCode: ['', Validators.required], // ITM000017
        itemDescription: ['', Validators.required], //  TAPAL DANEDAR POUCH 900G

        // CARDS
        intCode: ['', Validators.required], // CARD CODE
        cardDescription: ['', Validators.required], //  CARD DESCRIPTION
        inspectionCardId: ['', Validators.required], //  CARD ID

        // id: ['', Validators.required],    //  CARD ID

        // QUALITATIVE & QUANTITATIVE INSPECTION
        // FormArray FOR DYNAMIC ROWS
        qualitativeInspectionObjects: this.fb.array([]),
        quantitativeInspectionObjects: this.fb.array([]),
        id: [''], //  ITEM INSPECTION CARD ID
    });

    displayedColumnsQualitative = [
        'parameter',
        'passCriteria',
        'mandatory',
        'results',
        'pass',
        'fail',
    ];
    displayedColumnsQuantitative = [
        'parameterQty',
        'uoMId',
        'mandatoryQty',
        'passCriteriaTarget',
        'passCriteriaMax',
        'passCriteriaMin',
    ];

    qualitativeInspectionItems: qualitativeInspectionIF[] = [];
    quantitativeInspectionItems: quantitativeInspectionIF[] = [];

    dataSourceQualitativeInspection =
        new MatTableDataSource<qualitativeInspectionIF>(
            this.qualitativeInspectionItems
        );
    dataSourceQuantitativeInspection =
        new MatTableDataSource<quantitativeInspectionIF>(
            this.quantitativeInspectionItems
        );

    initializeTableDataItemInspectionCard(): void {
        // QUALITATIVE INSPECTION FormArray
        const formArrayQualitative = this.qualitativeInspectionObjects;
        this.qualitativeInspectionItems.forEach((qualitativeItem) => {
            formArrayQualitative.push(
                this.fb.group({
                    parameter: [qualitativeItem.parameter],
                    passCriteria: [qualitativeItem.passCriteria],
                    mandatory: [qualitativeItem.mandatory],
                    // pass: [qualitativeItem.pass],
                    // fail: [qualitativeItem.fail],
                    pass: [qualitativeItem.pass || []], // If pass is not provided, assign an empty array
                    fail: [qualitativeItem.fail || []], // If fail is not provided, assign an empty array
                })
            );
        });
        // QUANTITATIVE INSPECTION FormArray
        const formArrayQuantitative = this.quantitativeInspectionObjects;
        this.quantitativeInspectionItems.forEach((quantitativeItem) => {
            formArrayQuantitative.push(
                this.fb.group({
                    parameterQty: [quantitativeItem.parameterQty],
                    uoMId: [quantitativeItem.uoMId],
                    uoMCode: [quantitativeItem.uoMCode],
                    mandatoryQty: [quantitativeItem.mandatoryQty],
                    passCriteriaTarget: [quantitativeItem.passCriteriaTarget],
                    passCriteriaMax: [quantitativeItem.passCriteriaMax],
                    passCriteriaMin: [quantitativeItem.passCriteriaMin],
                })
            );
        });
        // Convert formArray.controls to raw values for MatTableDataSource
        this.dataSourceQualitativeInspection.data =
            formArrayQualitative.value as qualitativeInspectionIF[];

        this.dataSourceQuantitativeInspection.data =
            formArrayQuantitative.value as quantitativeInspectionIF[];
    }

    // QUALITATIVE
    get qualitativeInspectionObjects(): FormArray {
        return this.itemsInspectionCardsForm.get(
            'qualitativeInspectionObjects'
        ) as FormArray;
    }
    // QUANTITATIVE
    get quantitativeInspectionObjects(): FormArray {
        return this.itemsInspectionCardsForm.get(
            'quantitativeInspectionObjects'
        ) as FormArray;
    }

    addQualitativeInspectionRow(
        id: string,
        description: string,
        criteria: string
    ): void {
        const qualitativeFormGroup = this.fb.group({
            id: [id],
            parameter: [description],
            passCriteria: [criteria],
            mandatory: [false],
            pass: [], // Multiple pass values in array
            fail: [], // Multiple fail values in array

        });

        // Push the new form group into the FormArray
        this.qualitativeInspectionObjects.push(qualitativeFormGroup);

        // Ensure the data source is properly initialized
        if (!this.dataSourceQualitativeInspection) {
            this.dataSourceQualitativeInspection =
                new MatTableDataSource<qualitativeInspectionIF>([]);
        }

        if (
            !(
                this.dataSourceQualitativeInspection instanceof
                MatTableDataSource
            )
        ) {
            this.dataSourceQualitativeInspection = new MatTableDataSource(
                this.dataSourceQualitativeInspection
            );
        }

        // Update the dataSource with the latest FormArray values
        this.dataSourceQualitativeInspection.data = [
            ...this.qualitativeInspectionObjects.value,
        ];

        console.log(
            'Updated Qualitative DataSource:',
            this.dataSourceQualitativeInspection.data
        );
    }

    // CUSTOM VALIDATORS
    triggerValidationTarget(index: number): void {
        this.isValidate = false;
        const control = this.quantitativeInspectionObjects.controls[index].get('passCriteriaTarget');
        if (control) {
            control.markAsTouched();
            control.updateValueAndValidity();
        }
    }
    triggerValidationMax(index: number): void {
        this.isValidate = false;
        const control = this.quantitativeInspectionObjects.controls[index].get('passCriteriaMax');
        if (control) {
            control.markAsTouched();
            control.updateValueAndValidity();
        }
    }
    triggerValidationMin(index: number): void {
        this.isValidate = false;
        const control = this.quantitativeInspectionObjects.controls[index].get('passCriteriaMin');
        if (control) {
            control.markAsTouched();
            control.updateValueAndValidity();
        }
    }
    onTabChange(event: MatTabChangeEvent): void {
        if (event.index === 1) {
            this._snackBar.open('Fill the mandatory UOM, Target, Max, & Min Fields.', 'Close', {
                duration: 5000,
                panelClass: ['snackbar-error']
            });
        }
    }

    addQuantitativeInspectionRow(id: string, description: string): void {
        const quantitativeInspectionFormGroup = this.fb.group({
            id: [id],
            parameterQty: [description],
            uoMId: [''],
            uoMCode: [''],
            mandatoryQty: [false],
            passCriteriaTarget: [null, [Validators.required, Validators.min(1), Validators.pattern('^[1-9]+$')],],
            passCriteriaMax: [null, [Validators.required, Validators.min(1), Validators.pattern('^[1-9]+$')],],
            passCriteriaMin: [null, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+$')]]
        });

        this.quantitativeInspectionObjects.push(
            quantitativeInspectionFormGroup
        );

        if (!this.dataSourceQuantitativeInspection) {
            this.dataSourceQuantitativeInspection =
                new MatTableDataSource<quantitativeInspectionIF>([]);
        }

        if (
            !(
                this.dataSourceQuantitativeInspection instanceof
                MatTableDataSource
            )
        ) {
            this.dataSourceQuantitativeInspection = new MatTableDataSource(
                this.dataSourceQuantitativeInspection
            );
        }

        this.dataSourceQuantitativeInspection.data = [
            ...this.quantitativeInspectionObjects.value,
        ];
    }



    // ITEM CODE API
    // fetchListAllItemsSAP(): void {
    //     this._itemInspectionCardService.getListAllItems().subscribe({
    //         next: (response) => {
    //             if (response && response.isRequestSuccess && response.data) {
    //                 this.dataSourceItemCodeIIC = new MatTableDataSource(
    //                     response.data
    //                 );
    //                 console.log(
    //                     'FETCHED ITEMS:',
    //                     this.dataSourceItemCodeIIC.data
    //                 );
    //             } else {
    //                 console.warn('INVALID API RESPONSE:', response);
    //                 this.dataSourceItemCodeIIC = new MatTableDataSource([]);
    //             }
    //         },
    //         error: (err) => {
    //             console.error('ERROR FETCHING ITEMS:', err);
    //         },
    //     });
    // }
    // SAP API  - SAP ITEM CODE API
    pageSize = 25;
    pageNumber = 1;
    totalRecords = 0;
    fetchListAllItemsSAP(): void {
        this._SAPItemsService.getListAllItemsSAP(this.pageSize, this.pageNumber).subscribe({
            next: (response) => {
                try {
                    const parsedResponse = JSON.parse(response);

                    if (parsedResponse && parsedResponse.data && parsedResponse.data.values) {
                        // console.log('LIST ALL ITEMS API', parsedResponse);

                        this.dataSourceItemCodeIIC = new MatTableDataSource(parsedResponse.data.values);
                        this.totalRecords = parsedResponse.data.totalRecords;

                        console.log('FETCHED SAP ITEMS:', this.dataSourceItemCodeIIC.data);
                    } else {
                        console.warn('INVALID API RESPONSE:', parsedResponse);
                        this.dataSourceItemCodeIIC = new MatTableDataSource([]);
                    }
                } catch (error) {
                    console.error('JSON PARSE ERROR:', error);
                    this.dataSourceItemCodeIIC = new MatTableDataSource([]);
                }
            },
            error: (err) => {
                console.error('ERROR FETCHING ITEMS:', err);
            },
        });
    }
    onPageSizeChange(newSize: number): void {
        if (this.isSearchActive) return;
        this.pageSize = newSize;
        this.pageNumber = 1;
        this.fetchListAllItemsSAP();
    }
    nextPage(): void {
        if (this.isSearchActive) return;
        const maxPages = Math.ceil(this.totalRecords / this.pageSize);
        if (this.pageNumber < maxPages) {
            this.pageNumber++;
            this.fetchListAllItemsSAP();
        }
    }
    previousPage(): void {
        if (this.isSearchActive) return;
        if (this.pageNumber > 1) {
            this.pageNumber--;
            this.fetchListAllItemsSAP();
        }
    }

    // CARD CODE API
    fetchListAllCards(): void {
        this._itemInspectionCardService.ListAllInspectionCards().subscribe({
            next: (response) => {
                if (response && response.isRequestSuccess && response.data) {
                    this.dataSourceCardCodeIIC = new MatTableDataSource(
                        response.data
                    );
                    // console.log('FETCHED CARDS:', this.dataSourceCardCodeIIC.data);
                } else {
                    console.warn('INVALID API RESPONSE:', response);
                    this.dataSourceCardCodeIIC = new MatTableDataSource([]);
                }
            },
            error: (err) => {
                console.error('ERROR FETCHING ITEMS:', err);
            },
        });
    }

    dataSourceItemCodeIIC!: MatTableDataSource<any>;
    // ITEM CODE - ITEM INSPECTION CARD NG TEMPLATE STARTS
    @ViewChild('dialogTemplateItemCodeIIC') dialogTemplateItemCodeIIC;

    onItemCodeClickIIC() {
        this.isSearchActive = false;
        this.pageNumber = 1;
        this.fetchListAllItemsSAP();
        const dialogRef = this.dialog.open(this.dialogTemplateItemCodeIIC, {
            width: '75vw',
            height: '90vh',
            data: this.dataSourceItemCodeIIC,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }

    displayedColumnsItemCodeICC: string[] = [
        'itemCode',
        'itemDescription',
        'itemGroup',
    ];

    selectedIntCodeIIC: number;
    selectedItemCodeIIC: string;
    selectedItemDescriptionICC: string = '';

    onRowChangeItemCodeIIC(selectedRow: any): void {
        this.dataSourceItemCodeIIC.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }

    addSelectedRowItemCodeIIC(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceItemCodeIIC.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            // console.log('SELECTED ROW:', selectedRow);
            // this.itemsInspectionCardsForm
            //     .get('itemCode')
            //     .setValue(selectedRow.itemCode);
            // this.itemsInspectionCardsForm
            //     .get('itemDescription')
            //     .setValue(selectedRow.itemName);

            //  AGAINST SAP LIST ALL ITEMS
            this.itemsInspectionCardsForm.get('itemName').setValue(selectedRow.itemName);
            this.itemsInspectionCardsForm.get('itemType').setValue(selectedRow.itemType);
            this.itemsInspectionCardsForm.get('itemGroupCode').setValue(selectedRow.uoMGroupEntry);
            this.itemsInspectionCardsForm.get('itemU_QACard').setValue(selectedRow.u_QACard);
            this.itemsInspectionCardsForm.get('itemUoMGroupEntry').setValue(String(selectedRow.itemsGroupCode));
            this.itemsInspectionCardsForm.get('itemCode').setValue(selectedRow.itemCode);
            this.itemsInspectionCardsForm.get('itemDescription').setValue(selectedRow.itemName);


            this.selectedIntCodeIIC = selectedRow.intCode;
            // console.log("addSelectedRowItemCodeIIC - this.selectedIntCodeIIC:", this.selectedIntCodeIIC)
            this.selectedItemCodeIIC = selectedRow.itemCode;
            // console.log("addSelectedRowItemCodeIIC - this.selectedItemCodeIIC:", this.selectedItemCodeIIC)
            this.selectedItemDescriptionICC = selectedRow.itemName;
            // console.log("addSelectedRowItemCodeIIC - this.selectedItemDescriptionICC:", this.selectedItemDescriptionICC)
        } else {
            console.log('NO ROW SELECTED');
        }
    }

    isSearchActive = false;
    searchingItem = '';
    fetchSearchedItemsSAP(searchingItem: string): void {
        this._SAPItemsService.getSearchedSapItems(searchingItem).subscribe({
            next: (response) => {
                try {
                    const parsedResponse = JSON.parse(response);
                    if (parsedResponse && parsedResponse.data) {
                        this.dataSourceItemCodeIIC = new MatTableDataSource(parsedResponse.data);
                        this.isSearchActive = true;
                    } else {
                        this.dataSourceItemCodeIIC = new MatTableDataSource([]);
                    }
                } catch (error) {
                    console.error('JSON PARSE ERROR:', error);
                    this.dataSourceItemCodeIIC = new MatTableDataSource([]);
                }
            },
            error: (err) => {
                console.error('ERROR FETCHING SEARCH ITEMS:', err);
            },
        });
    }
    applyFilterItemCodeIIC(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.searchingItem = filterValue;
        if (!filterValue || filterValue.length < 3) {
            this.isSearchActive = false;
            this.pageNumber = 1;
            this.fetchListAllItemsSAP();
            return;
        } else {
            this.fetchSearchedItemsSAP(filterValue);
        }
    }
    // ITEM CODE - ITEM INSPECTION CARD NG TEMPLATE ENDS

    ListIAllCardsItemInspectionCard = [];
    // CARD CODE - ITEM INSPECTION CARD  NG TEMPLATE STARTS
    @ViewChild('dialogTemplateCardCodeIIC') dialogTemplateCardCodeIIC;

    // dataSourceCardCodeIIC = new MatTableDataSource<any>(this.ListIAllCardsItemInspectionCard);
    dataSourceCardCodeIIC = new MatTableDataSource<any>([]);

    onCardCodeClickIIC() {
        this.fetchListAllCards();
        const dialogRef = this.dialog.open(this.dialogTemplateCardCodeIIC, {
            width: '75vw',
            height: '75vh',
            data: this.dataSourceCardCodeIIC,
        });
        dialogRef.afterClosed().subscribe((result) => {
            // // console.log('DIALOG CLOSED');
        });
    }

    displayedColumnsCards: string[] = [
        'cardCode',
        'cardDescription',
        'cardStatus',
    ];
    selectedCardCode: string = '';
    selectedCardDescription: string = '';

    onRowChangeCardCodeIIC(selectedRow: any): void {
        this.dataSourceCardCodeIIC.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }

    addSelectedRowCardCodeIIC(): void {
        this.dialog.closeAll();
        const selectedRowCardCodeIIC = this.dataSourceCardCodeIIC.data.find(
            (row) => row.isSelected
        );

        if (selectedRowCardCodeIIC) {
            this.itemsInspectionCardsForm
                .get('intCode')
                .setValue(selectedRowCardCodeIIC.intCode);
            this.itemsInspectionCardsForm
                .get('cardDescription')
                .setValue(selectedRowCardCodeIIC.description);
            this.itemsInspectionCardsForm
                .get('inspectionCardId')
                .setValue(selectedRowCardCodeIIC.id);

            this.selectedCardCode = selectedRowCardCodeIIC.cardCode;
            this.selectedCardDescription =
                selectedRowCardCodeIIC.cardDescription;

            // console.log('SELECTED ROW:', selectedRowCardCodeIIC);

            // Call API dynamically with the selected ID / inspectionCardId
            const inspectionCardId = selectedRowCardCodeIIC.id;
            this._itemInspectionCardService
                .getCardCharacteristicsDataByCardId(inspectionCardId)
                .subscribe({
                    next: (response) => {
                        console.log('RECEIVED CHARACTERISTICS:', response);
                        // Process the fetched data
                        this.fetcheCardCharacteristicsByCardId(response.data);
                    },
                    error: (err) =>
                        console.error('ERROR FETCHING CHARACTERISTICS:', err),
                });
        } else {
            // console.log('NO ROW SELECTED');
        }
    }

    applyFilterCardCodeIIC(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCardCodeIIC.filter = filterValue.trim().toLowerCase();
    }

    fetcheCardCharacteristicsByCardId(characteristicsData: any): void {
        if (
            !characteristicsData ||
            !characteristicsData.responseCharacteristicWithCriteria
        ) {
            console.warn('No valid item data received.');
            return;
        }

        const qualitativeArray = this.qualitativeInspectionObjects;
        const quantitativeArray = this.quantitativeInspectionObjects;

        // CLEAR EXISTING FORM ARRAYS BEFORE ADDING NEW ONES
        qualitativeArray.clear();
        quantitativeArray.clear();

        characteristicsData.responseCharacteristicWithCriteria.forEach(
            (characteristic: any) => {
                const type = characteristic.type.toLowerCase(); //  toLowerCase TO HANDLE BOTH qualitative OR Qualitative

                if (type === 'qualitative') {
                    if (characteristic.qualitativeCriteriaResults.length > 0) {
                        // Push a row for each qualitativeCriteriaResult
                        characteristic.qualitativeCriteriaResults.forEach(
                            (criteria: any) => {
                                qualitativeArray.push(
                                    this.fb.group({
                                        id: characteristic.id,
                                        parameter: characteristic.description,
                                        passCriteria: criteria.description,
                                        mandatory: false,
                                        pass: [], // Multiple pass values in array
                                        fail: [], // Multiple fail values in array
                                    })
                                );
                            }
                        );
                    } else {
                        // Push a row even if there are no criteria results
                        qualitativeArray.push(
                            this.fb.group({
                                id: characteristic.id, // Assigning qualitative ID
                                parameter: characteristic.description,
                                passCriteria: '',
                                mandatory: false,
                                pass: '',
                                fail: '',
                            })
                        );
                    }
                } else if (type === 'quantitative') {
                    // Assigning quantitative ID
                    quantitativeArray.push(
                        this.fb.group({
                            id: characteristic.id, // Assigning quantitative ID
                            parameterQty: characteristic.description,
                            uoMId: '',
                            uoMCode: '',
                            mandatoryQty: false,
                            passCriteriaTarget: '',
                            passCriteriaMax: '',
                            passCriteriaMin: '',
                        })
                    );
                }
            }
        );

        // Update data sources for the tables
        //  this.dataSourceQualitativeInspection.data = qualitativeArray.value;
        this.dataSourceQualitativeInspection = qualitativeArray.value;
        this.dataSourceQuantitativeInspection = quantitativeArray.value;

        console.log(
            'UPDATED qualitativeArray:',
            this.dataSourceQualitativeInspection
        );
        // console.log('UPDATED qualitativeArray:', this.dataSourceQuantitativeInspection.data);
    }
    // CARD CODE NG TEMPLATE ENDS

    // QUANTITATIVE INSPECTION NG TEMPLATES
    // UOM NG TEMPLATE STARTS
    @ViewChild('dialogTemplateUoMIIC') dialogTemplateUoMIIC;
    dataSourceUoMIIC = new MatTableDataSource([]);
    selectedRowIndexUoM: number = -1; // Store the clicked row index

    onUoMQtyClickIIC(index: number) {
        // UOM - UNIT OF MEASURE API
        this._itemInspectionCardService
            .getAllUnitOfMeasureIIC()
            .subscribe((unitOfMeasure) => {
                this.dataSourceUoMIIC.data = unitOfMeasure.data;
            });
        this.selectedRowIndexUoM = index; //  Save index
        const dialogRef = this.dialog.open(this.dialogTemplateUoMIIC, {
            width: '75vw',
            height: '75vh',
            data: this.dataSourceUoMIIC,
        });
        dialogRef.afterClosed().subscribe((result) => {
            // console.log('DIALOG CLOSED');
        });
    }

    displayedColumnsUoMIIC: string[] = ['code', 'description', 'isActiveStatus'];
    selectedUoMCode: string = '';
    selectedUoMDescription: string = '';

    onRowChangeUoMIIC(selectedRow: any): void {
        this.dataSourceUoMIIC.data.forEach((row) => (row.isSelected = false));
        selectedRow.isSelected = true;
    }

    addSelectedRowUoMIICxx(index: number): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceUoMIIC.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            //  Set value in the correct row of FormArray
            this.quantitativeInspectionObjects.controls[index]
                .get('uoMId')
                ?.setValue(selectedRow.id);
            //  Store selected values for debugging
            this.selectedUoMCode = selectedRow.uoMCode;
            this.selectedUoMDescription = selectedRow.description;
            // console.log('SELECTED ROW:', selectedRow);
        } else {
            // console.log('NO ROW SELECTED');
        }
    }

    addSelectedRowUoMIIC(): void {
        this.dialog.closeAll();

        if (this.selectedRowIndexUoM === -1) {
            console.log('No row index selected');
            return;
        }

        const selectedRow = this.dataSourceUoMIIC.data.find(
            (row) => row.isSelected
        );

        if (selectedRow) {
            console.log('SELECTED ROW:', selectedRow);

            // Set the UoM value for the correct row only
            this.quantitativeInspectionObjects.controls[
                this.selectedRowIndexUoM
            ].patchValue({
                uoMId: selectedRow.id, // Save only in the row that triggered the modal
            });
            this.quantitativeInspectionObjects.controls[
                this.selectedRowIndexUoM
            ].patchValue({
                uoMCode: selectedRow.description, // Save only in the row that triggered the modal
            });

            // Reset after update
            this.selectedRowIndexUoM = -1;
        } else {
            console.log('NO ROW SELECTED');
        }
    }

    applyFilterUoMIIC(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceUoMIIC.filter = filterValue.trim().toLowerCase();
    }

    // ADD QUALITATIVE INSPECTION NG TEMPLATE STARTS
    @ViewChild('dialogTemplateAddQualitativeIIC')
    dialogTemplateAddQualitativeIIC;
    dataSourceAddQualitativeIIC = new MatTableDataSource([]);

    onAddQualitativeClickIIC() {
        const dialogRef = this.dialog.open(
            this.dialogTemplateAddQualitativeIIC,
            {
                width: '75vw',
                height: '75vh',
                data: this.dataSourceAddQualitativeIIC,
            }
        );
        dialogRef.afterClosed().subscribe((result) => {
            // console.log('DIALOG CLOSED');
        });
    }

    displayedColumnsAddQualitativeIIC: string[] = [
        'inspectionCode',
        'inspectionDescription',
        'inspectionCriteria',
    ];
    selectedQualitativeDescriptionIIC: string = '';
    selectedQualitativeCriteriaIIC: string = '';

    onRowChangeAddQualitativeIIC(selectedRow: any): void {
        this.dataSourceAddQualitativeIIC.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }

    addSelectedRowQualitativeIIC(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceAddQualitativeIIC.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            // Set the selected values
            this.selectedQualitativeDescriptionIIC = selectedRow.description;
            this.selectedQualitativeCriteriaIIC =
                selectedRow.inspectionCriteria;

            // Check if criteriaDescription exists
            const criteriaDescription = selectedRow.criteriaDescription || ''; // Default to empty if not available

            // console.log('SELECTED ROW:', selectedRow);

            // Call addQualitativeInspectionRow and pass the selected values
            // this.addQualitativeInspectionRow(selectedRow.id, selectedRow.description, selectedRow.criteriaDescription);
            this.addQualitativeInspectionRow(
                selectedRow.id,
                selectedRow.description,
                criteriaDescription
            );
        } else {
            // console.log('NO ROW SELECTED');
        }
    }

    applyFilterAddQualitativeIIC(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceAddQualitativeIIC.filter = filterValue
            .trim()
            .toLowerCase();
    }
    // ADD QUALITATIVE INSPECTION NG TEMPLATE ENDS

    // ADD QUANTITATIVE INSPECTION NG TEMPLATE STARTS
    @ViewChild('dialogTemplateAddQuantitativeIIC')
    dialogTemplateAddQuantitativeIIC;
    dataSourceAddQuantitativeIIC = new MatTableDataSource([]);

    onAddQuantitativeClickIIC() {
        const dialogRef = this.dialog.open(
            this.dialogTemplateAddQuantitativeIIC,
            {
                width: '75vw',
                height: '75vh',
                data: this.dataSourceAddQuantitativeIIC,
            }
        );
        dialogRef.afterClosed().subscribe((result) => {
            // console.log('DIALOG CLOSED');
        });
    }

    displayedColumnsAddQuantitativeIIC: string[] = [
        'inspectionCode',
        'inspectionDescription',
    ];
    selectedQuantitativeDescriptionIIC: string = '';

    onRowChangeAddQuantitativeIIC(selectedRow: any): void {
        this.dataSourceAddQuantitativeIIC.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }

    addSelectedRowQuantitativeIIC(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceAddQuantitativeIIC.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            // console.log('SELECTED ROW:', selectedRow);
            // Set the selected values
            this.selectedQuantitativeDescriptionIIC = selectedRow.description;

            // Call addQuantitativeInspectionRow and pass the selected values
            // this.addQuantitativeInspectionRow(this.selectedQuantitativeDescriptionIIC);
            this.addQuantitativeInspectionRow(
                selectedRow.id,
                selectedRow.description
            );
        } else {
            console.log('NO ROW SELECTED');
        }
    }

    applyFilterAddQuantitativeIIC(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceAddQuantitativeIIC.filter = filterValue
            .trim()
            .toLowerCase();
    }
    // ADD QUANTITATIVE INSPECTION NG TEMPLATE ENDS

    // QR STARTS
    dataSourceQRIIC = new MatTableDataSource([]);
    @ViewChild('dialogTemplateResultsIIC') dialogTemplateResultsIIC;

    selectedRowIndexResults: number = -1; // Store the clicked row index

    selectedRowData: RowData;

    onResultsClickIIC(index: number, data: any) {
        this.selectedRowIndexResults = index; // Save index
        // console.log(this.selectedRowIndexResults);
        this.selectedRowData = data; // Save data
        console.log(this.selectedRowData);
        // console.log(this.selectedRowData.id);

        const paramID = this.selectedRowData.id;
        const clickedRowParameter = this.selectedRowData.parameter;
        const clickedRowPassCriteria = this.selectedRowData.passCriteria;
        console.log(paramID);

        const dialogRef = this.dialog.open(this.dialogTemplateResultsIIC, {
            width: '75vw',
            height: '75vh',
            data: { paramID, clickedRowParameter, clickedRowPassCriteria },
            // data: this.dataSourceQRIIC,
        });
        dialogRef.afterClosed().subscribe((result) => {
            // console.log('DIALOG CLOSED');
        });
    }

    displayedColumnsResultsIIC: string[] = ['code', 'description', 'criteria'];

    qualitativeResultPassStatusObjects: any[] = [];
    qualitativeResultFailStatusObjects: any[] = [];
    // DOUBLE ARRAY IIC
    XXonSaveQualitativeResult(paramId: any, data: any): void {
        // Clear the arrays before adding new data to avoid duplication
        this.qualitativeResultPassStatusObjects = [];
        this.qualitativeResultFailStatusObjects = [];

        const filteredData = data.filteredData
            .map((row: any) => ({
                ...row,
                criteria:
                    row.criteria === 'true'
                        ? true
                        : row.criteria === 'false'
                            ? false
                            : row.criteria,
            }))
            .filter(
                (row: any) => row.criteria === true || row.criteria === false
            );

        filteredData.forEach((item: any) => {
            const resultObject = {
                qualitativeResultId: item.id,
                // isPassed: true,
                isPassed: item.criteria === true,
            };
            if (item.criteria === true) {
                this.qualitativeResultPassStatusObjects.push(resultObject);
            } else if (item.criteria === false) {
                this.qualitativeResultFailStatusObjects.push(resultObject);
            }
        });

        const qualitativeObjectsArray =
            this.qualitativeInspectionObjects.controls.map(
                (control) => control.value
            );

        const qualitativeObject = qualitativeObjectsArray.find(
            (obj: any) => obj.id === paramId
        );

        if (qualitativeObject) {
            qualitativeObject.qualitativeResultPassStatusObjects = [
                ...this.qualitativeResultPassStatusObjects,
            ];
            qualitativeObject.qualitativeResultFailStatusObjects = [
                ...this.qualitativeResultFailStatusObjects,
            ];

            console.log('Updated Qualitative Object:', qualitativeObject);
        } else {
            console.warn(
                '❌ No matching qualitativeInspectionObject found for paramId:',
                paramId
            );
        }

        const formArrayQualitative = this.qualitativeInspectionObjects;
        console.log('QUALITATIVE FORM ARRAY:', formArrayQualitative.value);

        const rowIndex = formArrayQualitative.controls.findIndex(
            (row: any) => row.value.id === paramId
        );

        if (rowIndex !== -1) {
            const rowData = formArrayQualitative.at(rowIndex).value;

            rowData.pass = filteredData
                .filter((item: any) => item.criteria === true)
                .map((item: any) => item.resultDescription);
            rowData.fail = filteredData
                .filter((item: any) => item.criteria === false)
                .map((item: any) => item.resultDescription);

            if (!this.dataSourceQualitativeInspection) {
                this.dataSourceQualitativeInspection =
                    new MatTableDataSource<qualitativeInspectionIF>([]);
            }

            if (
                !(
                    this.dataSourceQualitativeInspection instanceof
                    MatTableDataSource
                )
            ) {
                this.dataSourceQualitativeInspection = new MatTableDataSource(
                    this.dataSourceQualitativeInspection
                );
            }

            const index = this.dataSourceQualitativeInspection.data.findIndex(
                (row: any) => row.id === paramId
            );
            if (index !== -1) {
                this.dataSourceQualitativeInspection.data[index].pass = [
                    ...rowData.pass,
                ];
                this.dataSourceQualitativeInspection.data[index].fail = [
                    ...rowData.fail,
                ];
                this.dataSourceQualitativeInspection.data = [
                    ...this.dataSourceQualitativeInspection.data,
                ];
            } else {
                console.warn('⚠️ ROW NOT FOUND in dataSource!');
            }
        } else {
            console.warn('❌ ROW NOT FOUND for paramId:', paramId);
        }

        this.resetDropdownCriteria();
        this.dialog.closeAll();
    }
    // SINGLE ARRAY IIC
    onSaveQualitativeResult(paramId: any, data: any): void {

        // CLEAR THE ARRAY BEFORE ADDING NEW DATA TO AVOID DUPLICATION
        this.qualitativeResultPassStatusObjects = [];

        const filteredData = data.filteredData
            .map((row: any) => ({
                ...row,
                criteria:
                    row.criteria === 'true'
                        ? true
                        : row.criteria === 'false'
                            ? false
                            : row.criteria,
            }))
            .filter(
                (row: any) => row.criteria === true || row.criteria === false
            );

        // ADDING ALL INTO qualitativeResultPassStatusObjects ARRAY WITH THEIR CORRECT `isPassed` VALUE
        filteredData.forEach((item: any) => {
            const resultObject = {
                qualitativeResultId: item.id,
                isPassed: item.criteria === true,  // `true` for pass, `false` for fail
            };
            // ADDING BOTH  INTO THE SAME qualitativeResultPassStatusObjects ARRAY
            this.qualitativeResultPassStatusObjects.push(resultObject);
        });

        const qualitativeObjectsArray =
            this.qualitativeInspectionObjects.controls.map(
                (control) => control.value
            );

        const qualitativeObject = qualitativeObjectsArray.find(
            (obj: any) => obj.id === paramId
        );

        if (qualitativeObject) {
            this.isValidate = false;
            qualitativeObject.qualitativeResultPassStatusObjects = [
                ...this.qualitativeResultPassStatusObjects,
            ];

            console.log('Updated Qualitative Object:', qualitativeObject);
        } else {
            console.warn(
                '❌ No matching qualitativeInspectionObject found for paramId:',
                paramId
            );
        }

        const formArrayQualitative = this.qualitativeInspectionObjects;
        console.log('QUALITATIVE FORM ARRAY:', formArrayQualitative.value);

        const rowIndex = formArrayQualitative.controls.findIndex(
            (row: any) => row.value.id === paramId
        );

        if (rowIndex !== -1) {
            this.isValidate = false;
            const rowData = formArrayQualitative.at(rowIndex).value;

            rowData.pass = filteredData
                .filter((item: any) => item.criteria === true)
                .map((item: any) => item.resultDescription);
            rowData.fail = filteredData
                .filter((item: any) => item.criteria === false)
                .map((item: any) => item.resultDescription);

            if (!this.dataSourceQualitativeInspection) {
                this.dataSourceQualitativeInspection =
                    new MatTableDataSource<qualitativeInspectionIF>([]);
            }

            if (
                !(
                    this.dataSourceQualitativeInspection instanceof
                    MatTableDataSource
                )
            ) {
                this.dataSourceQualitativeInspection = new MatTableDataSource(
                    this.dataSourceQualitativeInspection
                );
            }

            const index = this.dataSourceQualitativeInspection.data.findIndex(
                (row: any) => row.id === paramId
            );
            if (index !== -1) {
                this.dataSourceQualitativeInspection.data[index].pass = [
                    ...rowData.pass,
                ];
                this.dataSourceQualitativeInspection.data[index].fail = [
                    ...rowData.fail,
                ];
                this.dataSourceQualitativeInspection.data = [
                    ...this.dataSourceQualitativeInspection.data,
                ];
            } else {
                console.warn('⚠️ ROW NOT FOUND in dataSource!');
            }
        } else {
            console.warn('❌ ROW NOT FOUND for paramId:', paramId);
        }

        this.resetDropdownCriteria();
        this.dialog.closeAll();
    }

    resetDropdownCriteria() {
        // Iterate over the underlying data array in MatTableDataSource
        this.dataSourceQRIIC.data.forEach((row: any) => {
            row.criteria = null; // or set it to some default value like `true` or `false`
        });

        // Ensure that MatTableDataSource is updated with the new data
        this.dataSourceQRIIC = new MatTableDataSource<any>(
            this.dataSourceQRIIC.data
        );
    }

    applyFilterQRIIC(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceQRIIC.filter = filterValue.trim().toLowerCase();
    }
    // DOUBLE ARRAY IIC
    XXsubmitItemsInspectionCardsForm(): void {
        if (this.itemsInspectionCardsForm.valid) {
            const formValues = this.itemsInspectionCardsForm.value;
            console.log('Raw Form Values hehe:', formValues);

            // Handle null values for itemU_QACard
            formValues.itemU_QACard = formValues.itemU_QACard || null;

            // Extract and exclude intCode
            const { intCode, ...payload } = formValues;

            // Ensure qualitativeInspectionObjects exists before using map
            if (Array.isArray(payload.qualitativeInspectionObjects)) {
                payload.qualitativeInspectionObjects =
                    payload.qualitativeInspectionObjects.map((item: any) => ({
                        inspectionCharacteristicId: item?.id ?? null, // Ensure it exists
                        isMandatory: item?.mandatory ?? false, // Ensure it exists
                        qualitativeResultPassStatusObjects: Array.isArray(
                            item?.qualitativeResultPassStatusObjects
                        )
                            ? item.qualitativeResultPassStatusObjects.map(
                                (result: any) => ({
                                    qualitativeResultId:
                                        result?.qualitativeResultId ?? null,
                                    isPassed: result?.isPassed ?? false,
                                })
                            )
                            : [], // Provide empty array if undefined
                        qualitativeResultFailStatusObjects: Array.isArray(
                            item?.qualitativeResultFailStatusObjects
                        )
                            ? item.qualitativeResultFailStatusObjects.map(
                                (result: any) => ({
                                    qualitativeResultId:
                                        result?.qualitativeResultId ?? null,
                                    isPassed: result?.isPassed ?? false,
                                })
                            )
                            : [], // Provide empty array if undefined
                    }));
            } else {
                payload.qualitativeInspectionObjects = []; // Default to empty array
            }

            // Ensure quantitativeInspectionObjects exists before using map
            if (Array.isArray(payload.quantitativeInspectionObjects)) {
                payload.quantitativeInspectionObjects =
                    payload.quantitativeInspectionObjects.map((item: any) => ({
                        inspectionCharacteristicId: item?.id ?? null, // Ensure it exists
                        isMandatory: item?.mandatoryQty ?? false, // Ensure it exists
                        uoMId: item?.uoMId ?? '', // Ensure UoM ID exists
                        // target: item?.passCriteriaTarget ? Number(item.passCriteriaTarget) : null,
                        // max: item?.passCriteriaMax ? Number(item.passCriteriaMax) : null,
                        // min: item?.passCriteriaMin ? Number(item.passCriteriaMin) : null,
                        target:
                            item?.passCriteriaTarget !== undefined
                                ? parseFloat(item.passCriteriaTarget)
                                : null,
                        max:
                            item?.passCriteriaMax !== undefined
                                ? parseFloat(item.passCriteriaMax)
                                : null,
                        min:
                            item?.passCriteriaMin !== undefined
                                ? parseFloat(item.passCriteriaMin)
                                : null,
                    }));
            } else {
                payload.quantitativeInspectionObjects = []; // Default to empty array
            }

            // 🚀 Log the final payload before sending
            console.log('FORM SUBMISSION PAYLOAD:', payload);

            return;

            this._itemInspectionCardService
                .AddItemInspectionCard(payload)
                .subscribe((response) => {
                    if (response.isRequestSuccess) {
                        console.log('API RUN SUCCESSFULLY.', payload);
                    } else {
                        console.error(
                            'ERROR WHILE ADDING DATA.',
                            response.message
                        );
                    }
                });
        } else {
            console.log('FORM IS INVALID!');
        }
    }
    // SINGLE ARRAY IIC
    submitItemsInspectionCardsForm(): void {
        this.isValidate = true;
        if (this.itemsInspectionCardsForm.valid) {
            const formValues = this.itemsInspectionCardsForm.value;
            console.log('✅ IIC FORM VALUES:', formValues);
            const itemCodeForQA = formValues.itemCode;
            console.log('Item Code for QA:', itemCodeForQA);
            // return;
            // Handle null values for itemU_QACard
            formValues.itemU_QACard = formValues.itemU_QACard || null;

            const { intCode, ...payload } = formValues; // EXCLUDING intCode

            // ✅ DEBUG: Checking qualitativeInspectionObjects before processing
            console.log("🔍 Before Processing - qualitativeInspectionObjects:", payload.qualitativeInspectionObjects);

            // ✅ Ensure qualitativeInspectionObjects EXISTS BEFORE USING map
            if (Array.isArray(payload.qualitativeInspectionObjects)) {
                payload.qualitativeInspectionObjects = payload.qualitativeInspectionObjects.map((item: any) => {
                    console.log("🛠️ Processing qualitative item:", item);
                    console.log("📌 qualitativeResultPassStatusObjects Before Processing:", item?.qualitativeResultPassStatusObjects);

                    // const qualitativeResultPassStatusObjects = [];

                    // ✅ SAFER APPROACH TO PREVENT EMPTY ARRAYS
                    const qualitativeResultPassStatusObjects = [...(item?.qualitativeResultPassStatusObjects || [])];

                    if (qualitativeResultPassStatusObjects.length > 0) {
                        console.log("✅ qualitativeResultPassStatusObjects found:", qualitativeResultPassStatusObjects);
                    } else {
                        console.warn("⚠️ qualitativeResultPassStatusObjects is missing or empty for item:", item);
                    }

                    return {
                        inspectionCharacteristicId: item?.id ?? null,
                        isMandatory: item?.mandatory ?? false,
                        qualitativeResultPassStatusObjects: qualitativeResultPassStatusObjects, // ✅ FINAL CHECK
                        qualitativeResultFailStatusObjects: [],
                    };
                });

                console.log("✅ After Processing - qualitativeInspectionObjects:", payload.qualitativeInspectionObjects);
            } else {
                console.warn("⚠️ qualitativeInspectionObjects is not an array, setting empty array.");
                payload.qualitativeInspectionObjects = [];
            }

            // ✅ DEBUG: Checking quantitativeInspectionObjects before processing
            console.log("🔍 Raw quantitativeInspectionObjects:", payload.quantitativeInspectionObjects);

            // ✅ Ensure quantitativeInspectionObjects EXISTS BEFORE USING map
            if (Array.isArray(payload.quantitativeInspectionObjects)) {
                payload.quantitativeInspectionObjects = payload.quantitativeInspectionObjects.map((item: any) => ({
                    inspectionCharacteristicId: item?.id ?? null,
                    isMandatory: item?.mandatoryQty ?? false,
                    uoMId: item?.uoMId ?? '',
                    target: item?.passCriteriaTarget !== undefined
                        ? parseFloat(item.passCriteriaTarget)
                        : null,
                    max: item?.passCriteriaMax !== undefined
                        ? parseFloat(item.passCriteriaMax)
                        : null,
                    min: item?.passCriteriaMin !== undefined
                        ? parseFloat(item.passCriteriaMin)
                        : null,
                }));
            } else {
                console.warn("⚠️ quantitativeInspectionObjects is not an array, setting empty array.");
                payload.quantitativeInspectionObjects = [];
            }

            // ✅ FINAL PAYLOAD CHECK
            console.log('🚀 IIC FINAL PAYLOAD TO API:', payload);

            this._itemInspectionCardService
                .AddItemInspectionCard(payload)
                .subscribe((response) => {
                    if (response.isRequestSuccess) {
                        console.log('✅ API RUN SUCCESSFULLY.', payload);
                        // this.stepper.next();
                        this._snackBar.open('Inspection Card created successfully!', 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-success']
                        });

                        // CALLING SAP API TO ENABLE ITEM FOR QA
                        this._SAPItemsService.enableItemForQA(itemCodeForQA)
                            .subscribe({
                                next: (sapResponse) => {
                                    if (sapResponse.succeeded) {
                                        console.log('✅ EnableItemForQA API RUN SUCCESSFULLY:', sapResponse);
                                        // this.stepper.next();
                                    } else {
                                        console.warn('⚠️ SAP API FAILED:', sapResponse.message);
                                        console.warn('⚠️ Response Message: Conversion failed when converting the nvarchar value  to data type int.');
                                        // this._snackBar.open(
                                        //     `FAILED TO ENABLE ITEM IN SAP FOR QA`,
                                        //     'Close',
                                        //     { duration: 500, panelClass: ['snackbar-error'] }
                                        // );
                                    }
                                },
                                error: (sapError) => {
                                    console.error('❌ SAP API ERROR:', sapError);
                                    // this._snackBar.open(
                                    //     'Error enabling item for QA. Please try again.',
                                    //     'Close',
                                    //     { duration: 500, panelClass: ['snackbar-error'] }
                                    // );
                                }
                            });
                        setTimeout(() => {
                            this.stepper.next();
                        }, 1550);

                    }
                    else {
                        console.warn('⚠️ API RESPONSE DID NOT SUCCEED:', response);
                        console.error('❌ ERROR WHILE ADDING DATA.', response.message);
                    }
                });
        } else {
            this.isValidate = false;
            this._snackBar.open('Fill all the mandatory fields with valid values.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }
    }
    // ITEM INSPECTION CARD ENDS




    loadCharacteristicsInspectionCard(id: string): void {
        this._inspectionCardService
            .getCharacteristicsByInspectionCardId(id)
            .subscribe(
                (res) => {
                    if (res.isRequestSuccess && res.data.length) {
                        const characteristics =
                            res.data[0].inspectionCharacteristicResults;

                        // ✅ Clear existing rows first
                        this.qualitativeTableCriteria.clear();
                        this.quantitativeTableCriteria.clear();

                        // Qualitative Rows
                        const qualitative = characteristics.filter(
                            (c) => c.type === 'qualitative'
                        );
                        qualitative.forEach((item) => {
                            this.qualitativeTableCriteria.push(
                                this.fb.group({
                                    parameter: [
                                        item.description,
                                        Validators.required,
                                    ],
                                    id: [item.id],
                                    intCode: [item.intCode],
                                })
                            );
                        });

                        // Quantitative Rows
                        const quantitative = characteristics.filter(
                            (c) => c.type === 'quantitative'
                        );
                        quantitative.forEach((item) => {
                            this.quantitativeTableCriteria.push(
                                this.fb.group({
                                    parameterX: [
                                        item.description,
                                        Validators.required,
                                    ],
                                    id: [item.id],
                                    intCode: [item.intCode],
                                })
                            );
                        });

                        // ✅ Yahan latest IDs save kar le form arrays se
                        this.rowDataIC.characteristicsIds = [
                            ...this.qualitativeTableCriteria.value.map(
                                (item) => item.id
                            ),
                            ...this.quantitativeTableCriteria.value.map(
                                (item) => item.id
                            ),
                        ];

                        console.log('Qualitative:', qualitative);
                        console.log('Quantitative:', quantitative);
                        console.log(
                            'Saved Existing Characteristic IDs:',
                            this.rowDataIC.characteristicsIds
                        );
                    } else {
                        console.error('No characteristics data found.');
                    }
                },
                (error) => console.error('Error loading characteristics', error)
            );
    }


    isLinear = false;

    ngOnInit(): void {
        // Inspection Card Code Get API.
        // this._inspectionCardsCode.getInspectionCardCode().subscribe((inspectionCardCode) => {
        //     const y = inspectionCardCode.data; // 13 mil raha hai
        //     console.log('Fetched Code:', y); // Check for debugging

        //     if (y) {
        //         const fullCode = `IC-000${y}`; // Combine 'ICH - ' with the fetched code
        //         this.fifthFormGroup.get('intCode')?.setValue(fullCode); // Set the combined value in the form
        //     }
        // });

        // this._qualityResultsCode.getQualitativeResultCode().subscribe((qualityResultCode) => {
        //     console.log('Quality Code:', qualityResultCode); // Debugging ke liye

        //     const fullCode = `QR-000${qualityResultCode.data || ''}`; // Code format
        //     this.firstFormGroup.get('data')?.setValue(fullCode); // Yahan correct form group use karo
        // });

        // Inspection Card Modal - Qualitative and Quantitative
        // this._inspectionCardModal.getInspectionCardModal().subscribe((inspectionCardModal) => {
        //     this.inspectionCardModalList = inspectionCardModal.data;
        // });



        // this.fetchListAllItems();
        this.addNewRowItemSampling();
        // ITEM INSPECTION CARD 3.1

        this.fourthFormGroup.get('type')?.valueChanges.subscribe((value) => {
            if (value === 'qualitative') {
                this.initializeQualitativeRow();
            } else {
                this.clearQualitativeCriteria();
            }
        });

        this.initializeTableWithDefaultRow(); // Initialize table with one row on load
        this.initializeTableWithDefaultRowX(); // Initialize table with one row on load

        // Item Inspection Card
        this.initializeTableDataItemInspectionCard();
        this.fetchListAllItemsSAP();
        // this.fetchListAllCards();

        // GET INSPECTION CHARACTERISTICS API
        this._itemInspectionCardService
            .getInspectionCharacteristicsIIC()
            .subscribe();

        // INSPECTION CHARACTERISTICS API FOR BOTH  QUALITATIVE  &  QUANTITATIVE
        // API CALL TO GET INSPECTION CHARACTERISTICS WITH CRITERIA
        this._itemInspectionCardService
            .getInspectionCharacteristicsWithCriteria()
            .subscribe((inspectionCardModal) => {
                const qualitativeData = inspectionCardModal.data.filter(
                    (item: any) => item.type === 'qualitative'
                );
                const quantitativeData = inspectionCardModal.data.filter(
                    (item: any) => item.type === 'quantitative'
                );

                qualitativeData.forEach((item: any) => {
                    item.qualitativeCriteriaResultsObjects =
                        item.qualitativeCriteriaResultsObjects || []; // Ensure it's always an array
                    // Setting the first criteria's description
                    item.criteriaDescription =
                        item.qualitativeCriteriaResultsObjects.length > 0
                            ? item.qualitativeCriteriaResultsObjects[0]
                                .description
                            : '';
                });

                this.dataSourceAddQualitativeIIC = new MatTableDataSource(
                    qualitativeData
                );
                this.dataSourceAddQuantitativeIIC = new MatTableDataSource(
                    quantitativeData
                );
            });

        // LIST ALL QUALITATIVE RESULTS
        this._itemInspectionCardService
            .ListAllQualitativeResultsIIC()
            .subscribe((items) => {
                this.dataSourceQRIIC.data = items.data;
                // const activeItems = items.data.filter(item => item.isActive === true);
                // this.dataSourceQRIIC.data = activeItems;
            });

        // UOM - UNIT OF MEASURE API
        // this._itemInspectionCardService
        //     .getAllUnitOfMeasureIIC()
        //     .subscribe((unitOfMeasure) => {
        //         this.dataSourceUoMIIC.data = unitOfMeasure.data;
        //     });

        // UPDATE QUALITATIVE RESULT STARTS
        //  RETRIEVING rowDataQR
        if (!this.rowDataQR) {
            const storedDataQR = sessionStorage.getItem('stepperDataQR'); // IF rowDataQR IS MISSING, GET FROM sessionStorage
            this.rowDataQR = storedDataQR ? JSON.parse(storedDataQR) : null;
        }
        if (this.rowDataQR) {
            // console.log('RECEIVED QR DATA:', this.rowDataQR);
            this.isEditMode = this.rowDataQR.isEditMode ?? false;
            console.log('isEditMode:', this.isEditMode);
            // POPULATE FORM, firstFormGroup, WITH RECEIVED DATA - rowDataQR
            this.populateQualitativeResultData(this.rowDataQR);
        } else {
            console.log('NO DATA RECEIVED');
            // this.isEditMode = false;
            // GETTING AND SETTING NEXT INT COUNT FOR QUALITATIVE RESULT
            this._qualityResultsCode
                .getQualitativeResultCode()
                .subscribe((qualityResultCode) => {
                    // console.log('Quality Code:', qualityResultCode);
                    const fullCode = `QR-000${qualityResultCode.data || ''}`;
                    this.firstFormGroup.get('data')?.setValue(fullCode);
                });


        }

        // UPDATE QUALITATIVE RESULT ENDS

        // UPDATE UOM - UNIT OF MEASURE STARTS
        //  RETRIEVING rowDataUOM
        if (!this.rowDataUOM) {
            const storedDataUOM = sessionStorage.getItem('stepperDataUOM'); // IF rowDataUOM IS MISSING, GET FROM sessionStorage
            this.rowDataUOM = storedDataUOM ? JSON.parse(storedDataUOM) : null;
        }
        if (this.rowDataUOM) {
            // this.isEditMode = true;
            this.isEditMode = this.rowDataUOM.isEditMode ?? false;
            // console.log('RECEIVED UOM DATA:', this.rowDataUOM);
            // POPULATE FORM, secondFormGroup, WITH RECEIVED DATA - rowDataQR
            this.populateUoMData(this.rowDataUOM);
        } else {
            console.log('NO DATA RECEIVED');
            // this.isEditMode = false;
            // GETTING AND SETTING NEXT INT COUNT FOR QUALITATIVE RESULT
        }
        // UPDATE UOM - UNIT OF MEASURE STARTS

        // UPDATE INSPECTION CHARACTERISTICS STARTS
        //  RETRIEVING rowDataICH
        if (!this.rowDataICH) {
            const storedDataICH = sessionStorage.getItem('stepperDataICH'); // IF rowDataICH IS MISSING, GET FROM sessionStorage
            this.rowDataICH = storedDataICH ? JSON.parse(storedDataICH) : null;
        }
        if (this.rowDataICH) {
            this.isEditMode = this.rowDataICH.isEditMode ?? false;
            console.log('isEditMode:', this.isEditMode);
            console.log('RECEIVED ICH DATA:', this.rowDataICH);
            // POPULATE FORM, fourthFormGroup, WITH RECEIVED DATA - rowDataICH
            this.populateInspectionCharacteristicsData(this.rowDataICH);
        } else {
            console.log('NO ICH DATA RECEIVED');
            // this.isEditMode = false;
            // GETTING AND SETTING NEXT INT COUNT FOR INSPECTION CHARACTERISITIC
            this._inspectionCharateristics
                .getInspectionCharacteristicsCode()
                .subscribe((intCodeICH) => {
                    const fetchedNextintCodeICH = intCodeICH.data;
                    console.log(
                        'fetchedNextintCodeICH:',
                        fetchedNextintCodeICH
                    );
                    if (fetchedNextintCodeICH) {
                        const formattedNextintCodeICH = `ICH-000${fetchedNextintCodeICH}`;
                        this.fourthFormGroup
                            .get('intCode')
                            ?.setValue(formattedNextintCodeICH);
                    }
                });
        }
        // UPDATE INSPECTION CHARACTERISTICS ENDS

        // UPDATE INSPECTION CARD STARTS
        //  RETRIEVING rowDataQR
        if (!this.rowDataIC) {
            const storedDataIC = sessionStorage.getItem('stepperDataIC'); // IF rowDataIC IS MISSING, GET FROM sessionStorage
            this.rowDataIC = storedDataIC ? JSON.parse(storedDataIC) : null;
        }
        if (this.rowDataIC) {
            // this.isEditMode = true;
            this.isEditMode = this.rowDataIC.isEditMode ?? false;
            console.log('isEditMode:', this.isEditMode);
            // console.log('RECEIVED IC DATA:', this.rowDataIC);
            // POPULATE FORM, fifthFormGroup, WITH RECEIVED DATA - rowDataIC
            this.populateICData(this.rowDataIC);
            // 🆕 Characteristics load kar rahe hain yahan:
            this.loadCharacteristicsInspectionCard(this.rowDataIC.id); // Yeh API call hogi ab
        } else {
            console.log('NO DATA RECEIVED');
            // this.isEditMode = false;
            // this.addTableRow();   // ✅ Only if creating new
            // this.addTableRowX();  // ✅ Only if creating new
            // GETTING AND SETTING NEXT INT COUNT FOR QUALITATIVE RESULT
            this._inspectionCardsCode.getInspectionCardCode().subscribe((inspectionCardCode) => {
                const y = inspectionCardCode.data;
                console.log('Fetched Code:', y); // Check for debugging

                if (y) {
                    const fullCode = `IC-000${y}`; // Combine 'ICH - ' with the fetched code
                    this.fifthFormGroup.get('intCode')?.setValue(fullCode); // Set the combined value in the form
                } else {
                    console.error('No code received from API');
                }
            });
        }
        // UPDATE INSPECTION CARD ENDS

        // UPDATE ITEM SAMPLE STARTS
        //  RETRIEVING rowDataIS
        if (!this.rowDataIS) {
            const storedDataIS = sessionStorage.getItem('stepperDataIS'); // IF rowDataIS IS MISSING, GET FROM sessionStorage
            this.rowDataIS = storedDataIS ? JSON.parse(storedDataIS) : null;
        }
        if (this.rowDataIS) {
            this.isEditMode = this.rowDataIS.isEditMode ?? false;
            console.log('RECEIVED ITEM SAMPLE DATA:', this.rowDataIS);
            // POPULATE FORM, itemSamplingForm, WITH RECEIVED DATA - rowDataIS
            this.populateItemSampleFormData(this.rowDataIS);
            this.getSamplingRangeBySampleId(this.rowDataIS.id)
        } else {
            console.log('NO ITEM SAMPLE DATA RECEIVED');
            // this.isEditMode = false;
            // GETTING AND SETTING NEXT INT COUNT FOR ITEM SAMPLE
            this._itemSamplesService.getSampleCodeIS().subscribe((sampleCodeIS) => {
                const fetchedCodeIS = sampleCodeIS.data;
                console.log('FETCHED SAMPLE CODE:', fetchedCodeIS);
                if (fetchedCodeIS) {
                    const formattedSampleCodeIS = `IS-000${fetchedCodeIS}`;
                    this.itemSamplingForm
                        .get('sampleCodeIS')
                        ?.setValue(formattedSampleCodeIS);
                }
            });
        }
        // UPDATE ITEM SAMPLE ENDS


        // UPDATE ITEM INSPECTION CARD STARTS
        //  RETRIEVING rowDataIIC
        if (!this.rowDataIIC) {
            const storedDataIIC = sessionStorage.getItem('stepperDataIIC'); // IF rowDataIIC IS MISSING, GET FROM sessionStorage
            this.rowDataIIC = storedDataIIC ? JSON.parse(storedDataIIC) : null;
        }
        if (this.rowDataIIC) {
            this.isEditMode = this.rowDataIIC.isEditMode ?? false;
            console.log('IIC - this.isEditMode:', this.isEditMode);
            // console.log('RECEIVED IIC DATA:', this.rowDataIIC);
            // POPULATE FORM, itemsInspectionCardsForm, WITH RECEIVED DATA - rowDataIIC
            this.populateIICData(this.rowDataIIC);
            this.loadBothCharacteristics(this.rowDataIIC.id);
            // this._itemInspectionCardService
            //     .getBothCharacteristicsByItemInspectionCard(this.rowDataIIC.id)
            //     .subscribe();

        } else {
            console.log('NO IIC DATA RECEIVED');
            // this.isEditMode = false;
            // this.addTableRow();   // ✅ Only if creating new
            // this.addTableRowX();  // ✅ Only if creating new
            // GETTING AND SETTING NEXT INT COUNT FOR QUALITATIVE RESULT
            // Inspection Card Code Get API.
            // this._inspectionCardsCode.getInspectionCardCode().subscribe((inspectionCardCode) => {
            //     const y = inspectionCardCode.data; // 13 mil raha hai
            //     console.log('Fetched Code:', y); // Check for debugging
            // Inspection Card Code Get API.
            // this._inspectionCardsCode.getInspectionCardCode().subscribe((inspectionCardCode) => {
            //     const y = inspectionCardCode.data; // 13 mil raha hai
            //     console.log('Fetched Code:', y); // Check for debugging

            //     if (y) {
            //         const fullCode = `IC-000${y}`; // Combine 'ICH - ' with the fetched code
            //         this.fifthFormGroup.get('intCode')?.setValue(fullCode); // Set the combined value in the form
            //     }
            // });
            //     if (y) {
            //         const fullCode = `IC-000${y}`; // Combine 'ICH - ' with the fetched code
            //         this.fifthFormGroup.get('intCode')?.setValue(fullCode); // Set the combined value in the form
            //     }
            // });
        }
    }

    ngAfterViewInit(): void {
        this._activatedRoute.queryParams.subscribe((params) => {
            const stepIndex = params['step'] ? +params['step'] : 0;
            Promise.resolve().then(
                () => (this.stepper.selectedIndex = stepIndex)
            ); // Ensure stepper is initialized
        });
    }

    fetchListAllItems(): void {
        this._itemSamplesService.getListAllItems().subscribe({
            next: (response) => {
                if (response && response.isRequestSuccess && response.data) {
                    this.dataSourceItemCodeIS = new MatTableDataSource(
                        response.data
                    );
                    console.log(
                        'FETCHED ITEMS:',
                        this.dataSourceItemCodeIS.data
                    );
                } else {
                    console.warn('INVALID API RESPONSE:', response);
                    this.dataSourceItemCodeIS = new MatTableDataSource([]);
                }
            },
            error: (err) => {
                console.error('ERROR FETCHING ITEMS:', err);
            },
        });
    }

    /** Getter for qualitativeCriteria FormArray */
    get qualitativeCriteriaObjects(): FormArray {
        return this.fourthFormGroup.get(
            'qualitativeCriteriaObjects'
        ) as FormArray;
    }
    /** Initialize one row in qualitativeCriteria */
    initializeQualitativeRow(): void {
        if (this.qualitativeCriteriaObjects.length === 0) {
            this.qualitativeCriteriaObjects.push(
                this._formBuilder.group({
                    // serialno: [''],
                    description: [''],
                })
            );
        }
    }

    /** Clear all rows in qualitativeCriteria */
    clearQualitativeCriteria(): void {
        while (this.qualitativeCriteriaObjects.length !== 0) {
            this.qualitativeCriteriaObjects.removeAt(0);
        }
    }

    get qualitativeTableCriteria(): FormArray {
        return this.fifthFormGroup.get('qualitativeTableCriteria') as FormArray;
    }

    get quantitativeTableCriteria(): FormArray {
        return this.fifthFormGroup.get(
            'quantitativeTableCriteria'
        ) as FormArray;
    }

    /** Initialize the table with one default row */
    initializeTableWithDefaultRow(): void {
        if (this.qualitativeTableCriteria.length === 0) {
            this.addTableRow();
        }
    }

    /** Initialize the table with one default row */
    initializeTableWithDefaultRowX(): void {
        if (this.quantitativeTableCriteria.length === 0) {
            this.addTableRowX();
        }
    }

    /** Add a new row to the qualitative table */
    addTableRow(): void {
        const row = this._formBuilder.group({
            parameter: [''],
        });
        this.qualitativeTableCriteria.push(row);
    }

    /** Remove a specific row by index */
    removeRow(index: number): void {
        this.qualitativeTableCriteria.removeAt(index);
    }

    @ViewChild('dialogTemplateItems') dialogTemplateItems;
    dataSourceItems = new MatTableDataSource([]);
    //
    selectedControlAccountRowIndex: number = -1;
    onItemCodeClick(rowIndex: number): void {
        const qualitativeData = this.inspectionCardModalList.filter(
            (item: any) => item.type === 'qualitative' && item.isActive
        );

        this.dataSourceItems = new MatTableDataSource(qualitativeData);
        //Item Inspection Card Modal
        this._inspectionCardModal
            .getInspectionCardModal()
            .subscribe((inspectionCardModal) => {
                const qualitativeData = inspectionCardModal.data.filter(
                    (item: any) => item.type === 'qualitative' && item.isActive
                );
                this.dataSourceItems = new MatTableDataSource(qualitativeData); // Qualitative data
            });

        console.log('Row Index:', rowIndex);
        this.selectedControlAccountRowIndex = rowIndex;
        console.log(this.selectedControlAccountRowIndex);
        const dialogRef = this.dialog.open(this.dialogTemplateItems, {
            width: '75vw',
            height: '75vh',
            data: this.dataSourceItems,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsItems: string[] = [
        'intCode',
        'description',
        'type',
        'isActive',
    ];
    selectedInspectionCode: string = '';
    selectedItemDescription: string = '';
    //
    onRowCheckboxChangeItems(selectedRow: any): void {
        if (this.dataSourceItems.data) {
            this.dataSourceItems.data.forEach(
                (row) => (row.isSelected = false)
            );
            selectedRow.isSelected = true;
        }
    }

    applyFilterItems(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceItems.filter = filterValue.trim().toLowerCase();
    }

    // DUPLICATE VALIDATION
    addSelectedRowItem(): void {
        this.dialog.closeAll();

        const selectedRow = this.dataSourceItems.data.find(
            (row) => row.isSelected
        );

        if (!selectedRow) {
            console.log('NO ROW SELECTED');
            return;
        }

        // CHECK IF CHARACTERISTIC IS ALREADY EXISTS
        const isDuplicateCharacteristic = this.qualitativeTableCriteria.controls.some((control) => {
            const formGroup = control as FormGroup;
            return formGroup.get('parameter')?.value === selectedRow.description;
        });

        if (isDuplicateCharacteristic) {
            this._snackBar.open('DUPLICATE ENTRY: SELECTED CHARACTERISTIC IS ALREADY ATTACHED.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }

        if (this.selectedControlAccountRowIndex !== -1) {
            const rowFormGroup = this.qualitativeTableCriteria.at(
                this.selectedControlAccountRowIndex
            ) as FormGroup;
            rowFormGroup.get('parameter')?.setValue(selectedRow.description);
            this.selectedInspectionCode = selectedRow.intCode;
            this.selectedItemDescription = selectedRow.description;

            console.log('SELECTED ROW:', selectedRow);
            console.log('UPDATED ROW INDEX:', this.selectedControlAccountRowIndex);
        }

        // Reset the index after selection
        this.selectedControlAccountRowIndex = -1;
    }

    //Quantitative Column

    addTableRowX(): void {
        const row = this._formBuilder.group({
            parameterX: [''],
        });
        this.quantitativeTableCriteria.push(row);
    }

    removeRowX(index: number): void {
        this.quantitativeTableCriteria.removeAt(index);
    }

    @ViewChild('dialogTemplateItemsX') dialogTemplateItemsX;
    dataSourceItemsX = new MatTableDataSource([]);

    onItemCodeClickX(rowIndex: number): void {
        const quantitativeData = this.inspectionCardModalList.filter(
            (item: any) => item.type === 'quantitative' && item.isActive
        );

        this.dataSourceItemsX = new MatTableDataSource(quantitativeData);
        this._inspectionCardModal
            .getInspectionCardModal()
            .subscribe((inspectionCardModal) => {
                const quantitativeData = inspectionCardModal.data.filter(
                    (item: any) => item.type === 'quantitative' && item.isActive
                );
                this.dataSourceItemsX = new MatTableDataSource(quantitativeData); // Quantitative data
            });
        this.selectedControlAccountRowIndex = rowIndex;
        const dialogRef = this.dialog.open(this.dialogTemplateItemsX, {
            width: '75vw',
            height: '75vh',
            data: this.dataSourceItemsX,
        });
        dialogRef.afterClosed().subscribe(() => {
            console.log('Dialog closed');
        });
    }


    displayedColumnsItemsX: string[] = [
        'intCode',
        'description',
        'type',
        'isActive',
    ];

    onRowCheckboxChangeItemsX(selectedRow: any): void {
        this.dataSourceItemsX.data.forEach((row) => (row.isSelected = false));
        selectedRow.isSelected = true;
    }

    applyFilterItemsX(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceItemsX.filter = filterValue.trim().toLowerCase();
    }

    // DUPLICATE VALIDATION
    addSelectedRowItemX(): void {
        this.dialog.closeAll();

        const selectedRow = this.dataSourceItemsX.data.find(
            (row) => row.isSelected
        );

        if (!selectedRow) {
            console.log('NO ROW SELECTED');
            return;
        }

        // CHECK IF CHARACTERISTIC IS ALREADY EXISTS
        const isDuplicate = this.quantitativeTableCriteria.controls.some((control) => {
            const formGroup = control as FormGroup;
            return formGroup.get('parameterX')?.value === selectedRow.description;
        });

        if (isDuplicate) {
            this._snackBar.open('DUPLICATE ENTRY: SELECTED CHARACTERISTIC IS ALREADY ATTACHED.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }

        if (this.selectedControlAccountRowIndex !== -1) {
            const rowFormGroup = this.quantitativeTableCriteria.at(
                this.selectedControlAccountRowIndex
            ) as FormGroup;
            rowFormGroup.get('parameterX')?.setValue(selectedRow.description);
            rowFormGroup.get('id')?.setValue(selectedRow.id); // Storing the `id` in form

            console.log('SELECTED ROW:', selectedRow);
        }

        // Reset the index after selection
        this.selectedControlAccountRowIndex = -1;
    }

    // XonSubmitQualitativeResult(): void {
    //     const qualitativePayload = {
    //         resultDescription: this.firstFormGroup.value.resultDescription
    //     }
    //     const payload = {
    //         uoMCode: this.secondFormGroup.value.uoMCode,
    //         description: this.secondFormGroup.value.description
    //     }
    //    const qualitative = this._qualitativeResultsService.AddQualitativeResult(qualitativePayload).toPromise()
    //     const unitofmeasure = this._uommasterservice.AddUnitOfMeasure(payload).toPromise()
    //     Promise.all([qualitative, unitofmeasure])
    //     .then(res => {
    //         console.log(qualitative, unitofmeasure);

    //     })

    //   }

    onSubmitQualitativeResult(): void {
        this.isValidate = true;
        if (this.firstFormGroup.valid) {
            const formValues = this.firstFormGroup.value;
            const { data, ...payload } = formValues; // EXCLUDING `data`
            console.log('SENDING QR PAYLOAD:', payload); // 

            this.isLoading = true;  // 
            this._qualitativeResultsService
                .AddQualitativeResult(payload)
                .subscribe(
                    (response) => {
                        if (response.isRequestSuccess) {
                            console.log('API RUN SUCCESSFULLY.', payload);
                            this._snackBar.open('Data saved successfully!', 'Close', {
                                duration: 1550,
                                panelClass: ['snackbar-success']
                            });
                            this.firstFormGroup.get('resultDescription')?.setValue(null);
                            this._qualityResultsCode
                                .getQualitativeResultCode()
                                .subscribe(
                                    (qualityResultCode) => {
                                        const fullCode = `QR-000${qualityResultCode.data || ''}`;
                                        this.firstFormGroup.get('data')?.setValue(fullCode);
                                        console.log('NEW DATA VALUE:', this.firstFormGroup.get('data')?.value);
                                        setTimeout(() => {
                                            this.isLoading = false;
                                        }, 1500);
                                    },
                                    (error) => {
                                        console.error('GET QUALITY CODE FAILED:', error);
                                        this.isLoading = false;
                                    }
                                );
                        }
                    },
                    (error) => {
                        console.error('API REQUEST FAILED:', error);
                        console.log('API ERROR RESPONSE:', error.error);
                        let errorMessage = "This description is already being used and cannot be duplicated.";
                        if (error.error) {
                            if (error.error.exception?.resultDescription?.length) {
                                errorMessage = error.error.exception.resultDescription[0];
                            } else if (error.error.message) {
                                errorMessage = error.error.message;
                            }
                        }
                        this._snackBar.open(errorMessage, 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-error']
                        });
                        this.isLoading = false;
                    }
                );
        } else {
            this.isValidate = false;
            this._snackBar.open('Fill the mandatory Description field.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
        }
    }

    onSubmitUnitOfMeasure(): void {
        this.isValidate = true;
        if (this.secondFormGroup.valid) {
            // console.log('UOM FORM VALUES:', this.secondFormGroup.value);
            const formValues = this.secondFormGroup.value;
            const payload = { ...formValues };
            // console.log('SENDING UOM PAYLOAD:', payload);
            // return;
            this.isLoading = true;  // 
            this._uommasterservice
                .AddUnitOfMeasure(payload)
                .subscribe(
                    (response) => {
                        if (response.isRequestSuccess) {
                            console.log('API RUN SUCCESSFULLY.', payload);
                            this._snackBar.open('Data saved successfully!', 'Close', {
                                duration: 1500,
                                panelClass: ['snackbar-success']
                            });
                            this.secondFormGroup.get('uoMCode')?.setValue(null);
                            this.secondFormGroup.get('description')?.setValue(null);
                            setTimeout(() => {
                                this.isLoading = false;
                            }, 1550);
                        }
                        // this.stepper.next();
                    },
                    (error) => {
                        console.error('API REQUEST FAILED:', error);
                        console.log('FULL ERROR OBJECT:', JSON.stringify(error, null, 2));
                        let errorMessages = [];

                        if (error.error && error.error.exception) {
                            const exception = error.error.exception;
                            const hasDescriptionError = exception.description?.length > 0;
                            const hasUoMCodeError = exception.uoMCode?.length > 0;
                            // IF uoMCode & description BOTH ARE DUPLICATE
                            if (hasDescriptionError && hasUoMCodeError) {
                                errorMessages.push("Duplicate data cannot be added. This record already exists.");
                            } else {
                                // IF description IS DUPLICATE
                                if (hasDescriptionError) {
                                    errorMessages.push(exception.description[0]);
                                }
                                // IF uoMCode IS DUPLICATE
                                if (hasUoMCodeError) {
                                    errorMessages.push(exception.uoMCode[0]);
                                }
                            }
                            setTimeout(() => {
                                this.isLoading = false;
                            }, 2000);
                        }

                        // fallback
                        if (errorMessages.length === 0) {
                            errorMessages.push(
                                error.error?.message || "Error adding UnitOfMeasure"
                            );
                            setTimeout(() => {
                                this.isLoading = false;
                            }, 2000);
                        }

                        const finalErrorMessage = errorMessages.join(' ');
                        console.log('FINAL MESSAGE:', finalErrorMessage);

                        this._snackBar.open(finalErrorMessage, 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-error']
                        });
                    }
                );
        } else {
            this.isValidate = false;
            this._snackBar.open('Fill all the mandatory fields.', 'Close', {
                duration: 1500,
                panelClass: ['snackbar-error']
            });
            return;
        }
    }


    updateSingleCriteriaValidation() {
        const singleCriteriaControl = this.fourthFormGroup.get('singleCriteria');

        if (this.fourthFormGroup.get('type')?.value === 'qualitative') {
            singleCriteriaControl?.setValidators([Validators.required]);
        } else {
            singleCriteriaControl?.clearValidators();
            singleCriteriaControl?.setValue('');
        }

        singleCriteriaControl?.updateValueAndValidity();
    }

    onSubmitInspectionCharacteristics(): void {
        if (!this.fourthFormGroup.valid) {
            this._snackBar.open('Fill all the mandatory fields.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }

        const formValues = this.fourthFormGroup.value;
        const { intCode, qualitativeCriteriaObjects, ...payload } = formValues;
        if (payload.type === 'quantitative') {
            payload.singleCriteria = '';
        }
        console.log('SENDING INSPECTION CHARACTERISTICS PAYLOAD:', payload);

        this.isLoading = true;
        this._inspectionCharateristics.AddInspectionCharacteristics(payload)
            .pipe(
                switchMap(response => {
                    if (response.isRequestSuccess) {
                        console.log('API RUN SUCCESSFULLY.', payload);
                        this._snackBar.open('Data saved successfully!', 'Close', {
                            duration: 1550,
                            panelClass: ['snackbar-success']
                        });
                        setTimeout(() => {
                            this.fourthFormGroup.get('description')?.setValue('');
                            this.fourthFormGroup.get('singleCriteria')?.setValue('');
                        }, 1500);
                        return this._inspectionCharateristics.getInspectionCharacteristicsCode();
                    }
                    throw new Error(response.message || 'Request failed');
                })
            )
            .subscribe(
                (intCodeICH) => {
                    const fetchedNextintCodeICH = intCodeICH.data;
                    if (fetchedNextintCodeICH) {
                        const formattedNextintCodeICH = `ICH-000${fetchedNextintCodeICH}`;
                        setTimeout(() => {
                            this.fourthFormGroup.get('intCode')?.setValue(formattedNextintCodeICH);
                            console.log('New Inspection Code:', this.fourthFormGroup.get('intCode')?.value);
                            this.isLoading = false;
                        }, 1500);
                    } else {
                        console.error('FAILED TO GET NEW INSPECTION CODE');
                        this.isLoading = false;
                    }
                },
                (error) => {
                    console.error('API REQUEST FAILED:', error);
                    let errorMessage = "This description is already being used and cannot be duplicated.";
                    if (error.error) {
                        if (error.error.exception?.description?.length) {
                            errorMessage = error.error.exception.description[0];
                        } else if (error.error.message) {
                            errorMessage = error.error.message;
                        }
                    }
                    this._snackBar.open(errorMessage, 'Close', {
                        duration: 1500,
                        panelClass: ['snackbar-error']
                    });
                    setTimeout(() => {
                        this.isLoading = false;
                    }, 1500);
                }
            );
    }

    // onSubmit(): void {
    //     if (this.fifthFormGroup.valid) {
    //         console.log('Form Submitted:', this.fifthFormGroup.value);
    //     } else {
    //         console.log('Form is invalid');
    //     }
    // }

    onSubmitItemSamplingForm(): void {
        this.isValidate = true;
        if (this.itemSamplingForm.valid) {
            const formValues = this.itemSamplingForm.value;
            // const payload = { ...formValues, };
            const { id, itemCode, sampleCodeIS, ...payload } = formValues; // EXCLUDING itemCode & sampleCodeIS

            // VALIDATION CHECKS FOR samplingRangeObjects
            const samplingRanges = payload.samplingRangeObjects as Array<{ sampleQty: number; lotSizeMin: number; lotSizeMax: number }>;
            for (let i = 0; i < samplingRanges.length; i++) {
                const range = samplingRanges[i];
                if (range.lotSizeMin >= range.lotSizeMax) {
                    const errorMessage = "Lot Size Min must be less than Lot Size Max.";
                    this._snackBar.open(errorMessage, 'Close', {
                        duration: 3000,
                        panelClass: ['snackbar-error']
                    });
                    return;
                }
                if (range.sampleQty < range.lotSizeMin || range.sampleQty > range.lotSizeMax) {
                    const errorMessage = "Sample Qty must be within the bounds of Lot Size Min and Lot Size Max.";
                    this._snackBar.open(errorMessage, 'Close', {
                        duration: 3000,
                        panelClass: ['snackbar-error']
                    });
                    return;
                }
                for (let j = 0; j < i; j++) {
                    const prevRange = samplingRanges[j];
                    if (range.lotSizeMin <= prevRange.lotSizeMax) {
                        const errorMessage = "The defined sampling ranges must not overlap.";
                        this._snackBar.open(errorMessage, 'Close', {
                            duration: 3000,
                            panelClass: ['snackbar-error']
                        });
                        return;
                    }
                }
            }

            console.log('FORM SUBMISSION PAYLOAD:', payload);
            // this.itemSamplingForm.reset();
            // return;
            this._itemSamplesService
                .AddSampleWithRanges(payload)
                .subscribe(
                    (response) => {
                        if (response.isRequestSuccess) {
                            console.log('API RUN SUCCESSFULLY.', payload);
                            this._snackBar.open('DATA SAVED SUCCESSFULLY!', 'Close', {
                                duration: 2000,
                                panelClass: ['snackbar-success']
                            });
                            this.itemSamplingForm.reset();
                            this.stepper.next();
                        } else {
                            console.log('API RESPONSE (NON-ERROR):', response);
                        }
                    },
                    (error) => {
                        console.error('API REQUEST FAILED:', error);
                        console.log('API ERROR RESPONSE:', error.error);
                        let errorMessage = 'Error while adding data.';
                        if (error.error) {
                            if (error.error.exception?.itemId?.length) {
                                errorMessage = "SAME ITEM CANNOT BE DUPLICATED. THIS ITEM ALREADY EXISTS.";
                                // API RESPONSE 
                                // message: errorMessage = error.error.exception.itemId[0];
                            } else if (error.error.exception?.[`samplingRangeObjects[0]`]?.length) {
                                errorMessage = error.error.exception[`samplingRangeObjects[0]`][0];
                            } else if (error.error.message) {
                                errorMessage = error.error.message;
                            }
                        }
                        this._snackBar.open(errorMessage, 'Close', {
                            duration: 3000,
                            panelClass: ['snackbar-error']
                        });
                    }
                );
        } else {
            this._snackBar.open('FILL ALL THE MANDATORY FIELDS WITH VALID VALUES.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }
    }


    // Submit Inspection Card

    onSubmitInspectionCard(): void {
        if (!this.fifthFormGroup.valid) {
            this._snackBar.open('Fill the mandatory Description field.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }

        const formValue = this.fifthFormGroup.value;

        // Validation: At least one qualitative and one quantitative characteristic required
        const hasQualitative = formValue.qualitativeTableCriteria.length > 0;
        const hasQuantitative = formValue.quantitativeTableCriteria.length > 0;

        if (!hasQualitative || !hasQuantitative) {
            this._snackBar.open('At least one qualitative and one quantitative characteristic is required.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }

        this.isLoading = true; 
        this._inspectionCharateristics.getInspectionCharacteristics()
            .pipe(
                switchMap((charResponse) => {
                    const mappedIds = charResponse.data.map((char: any) => ({
                        description: char.description,
                        id: char.id,
                    }));

                    // Find matching qualitative IDs
                    const qualitativeIds = formValue.qualitativeTableCriteria
                        .map((item) => mappedIds.find((char) => char.description === item.parameter)?.id)
                        .filter(Boolean);

                    // Find matching quantitative IDs
                    const quantitativeIds = formValue.quantitativeTableCriteria
                        .map((item) => mappedIds.find((char) => char.description === item.parameterX)?.id)
                        .filter(Boolean);

                    // Validation: Ensure mapped IDs are not empty
                    if (qualitativeIds.length === 0 || quantitativeIds.length === 0) {
                        this._snackBar.open('At least one valid qualitative and one valid quantitative characteristic is required.', 'Close', {
                            duration: 3000,
                            panelClass: ['snackbar-error']
                        });
                        return of(null); // Return an Observable to stop the chain gracefully
                    }

                    // Final API payload
                    const apiPayload = {
                        description: formValue.description,
                        isActive: formValue.isActive,
                        characteristicsIds: [...qualitativeIds, ...quantitativeIds],
                    };

                    console.log('Final API Payload:', apiPayload);
                    return this._inspectionCard.AddInspectionCard(apiPayload);
                }),
                switchMap((response) => {
                    if (response === null) {
                        // Validation failed earlier, stop here
                        this.isLoading = false;
                        return of(null);
                    }
                    if (response?.isRequestSuccess) {
                        console.log('🎉 API RUN SUCCESSFULLY:', response);
                        this._snackBar.open('Data saved successfully!', 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-success']
                        });
                        this.fifthFormGroup.get('description')?.setValue('');
                        this.qualitativeTableCriteria.clear();
                        this.quantitativeTableCriteria.clear();
                        this.initializeTableWithDefaultRow(); 
                        this.initializeTableWithDefaultRowX(); 
                        return this._inspectionCardsCode.getInspectionCardCode();
                    }
                    throw response; // Throw full response for error handling
                })
            )
            .subscribe(
                (inspectionCardCode) => {
                    if (inspectionCardCode === null) {
                        // Chain stopped due to validation
                        return;
                    }
                    const y = inspectionCardCode.data;
                    console.log('Fetched Code:', y); // Debugging
                    if (y) {
                        const fullCode = `IC-000${y}`;
                        setTimeout(() => {
                            this.fifthFormGroup.get('intCode')?.setValue(fullCode);
                            console.log('New Inspection Card Code:', this.fifthFormGroup.get('intCode')?.value);
                            this.isLoading = false; 
                        }, 1500);
                    } else {
                        console.error('No code received from API');
                        this.isLoading = false; 
                    }
                },
                (error) => {
                    console.error('❌ API REQUEST FAILED:', error);
                    let errorMessage = "This description is already being used and cannot be duplicated.";
                    if (error.exception?.description?.length) {
                        errorMessage = error.exception.description[0]; 
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    this._snackBar.open(errorMessage, 'Close', {
                        duration: 1500,
                        panelClass: ['snackbar-error']
                    });
                    setTimeout(() => {
                        this.isLoading = false; 
                    }, 1500);
                }
            );
    }




    // UPDATE QUALITATIVE RESULT STARTS
    populateQualitativeResultData(data: any): void {
        if (!data) {
            console.error('NO DATA RECEIVED TO POPULATE THE FORM FIELDS.');
            return;
        }
        // MAPPING RESPONSE
        console.log(data);
        const formattedQRintCode =
            'QR-' + this.rowDataQR.intCode.toString().padStart(5, '0');
        this.firstFormGroup.patchValue({
            id: this.rowDataQR.id,
            data: formattedQRintCode,
            resultDescription: this.rowDataQR.resultDescription,
            isActive: this.rowDataQR.isActive,
        });
    }

    onUpdateQualitativeResult(): void {
        this.isValidate = true;
        if (this.firstFormGroup.valid) {
            const formValues = this.firstFormGroup.value;
            const { data, ...payload } = formValues; // EXCLUDING intCode
            this._qualitativeResultsService
                .UpdateQualitativeResult(payload)
                .subscribe(
                    (response) => {
                        if (response.isRequestSuccess) {
                            console.log('API RUN SUCCESSFULLY.', payload);
                            this._snackBar.open('Record Updated Successfully.', 'Close', {
                                duration: 1500,
                                panelClass: ['snackbar-error']
                            });
                            setTimeout(() => {
                                this._router.navigate(['/master-data/list-of-qualitative-result'], {
                                    relativeTo: this._activatedRoute,
                                });
                            }, 1500);
                            this.clearingSessionStorage();
                            console.log('this.isEditMode.', this.isEditMode);
                        } else {
                            console.error(
                                'ERROR WHILE UPDATING DATA.',
                                response.message
                            );
                        }
                    },
                    (error) => {
                        console.error('API REQUEST FAILED:', error);
                        // EXTRACT error message FROM API RESPONSE
                        let errorMessage = 'Something went wrong. Please try again.';
                        if (error.error && error.error.exception && error.error.exception.id) {
                            errorMessage = error.error.exception.id[0] || errorMessage;
                        }
                        this._snackBar.open(errorMessage, 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-error']
                        });
                        setTimeout(() => {
                            this._router.navigate(['/master-data/list-of-qualitative-result'], {
                                relativeTo: this._activatedRoute,
                            });
                            this.clearingSessionStorage();
                            console.log('this.isEditMode.', this.isEditMode);
                        }, 2000);
                    }
                );
        } else {
            this.isValidate = false;
            this._snackBar.open('Fill the mandatory Description field.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }
    }
    // UPDATE QR - QUALITATIVE RESULT ENDS

    // UPDATE UOM - UNIT OF MEASURE STARTS
    populateUoMData(data: any): void {
        if (!data) {
            console.error('NO DATA RECEIVED TO POPULATE THE FORM FIELDS.');
            return;
        }
        // MAPPING RESPONSE
        // console.log('UOM DATA TO POPULATE:',data);
        this.secondFormGroup.patchValue({
            id: this.rowDataUOM.id,
            uoMCode: this.rowDataUOM.uoMCode,
            description: this.rowDataUOM.description,
            isActive: this.rowDataUOM.isActive,
        });
    }

    onUpdateUoM(): void {
        this.isValidate = true;
        if (this.secondFormGroup.valid) {
            const payload = this.secondFormGroup.value;
            console.log(payload);
            // return;
            this._uommasterservice.updateUnitOfMeasure(payload).subscribe(
                (response) => {
                    if (response.isRequestSuccess) {
                        console.log('API RUN SUCCESSFULLY.', payload);
                        this._snackBar.open('Record Updated Successfully.', 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-success']
                        });
                        this._router.navigate(['/master-data/list-of-unit-measure-setup'], {
                            relativeTo: this._activatedRoute
                        });
                        this.clearingSessionStorage();
                        console.log('this.isEditMode.', this.isEditMode);
                    }
                },
                (error) => {
                    console.error('API REQUEST FAILED:', error);
                    let errorMessage = 'Duplicate data cannot be updated. This record already exists.';
                    if (error.error) {
                        if (error.error.statusCode === 400) {
                            errorMessage = error.error.message || 'Details already exist for another record';
                        } else if (error.error.statusCode === 402) {
                            errorMessage = 'Already being used so cannot be updated';
                        } else if (error.error.message) {
                            errorMessage = error.error.message;
                        }
                    }
                    this._snackBar.open(errorMessage, 'Close', {
                        duration: 1500,
                        panelClass: ['snackbar-error']
                    });
                    setTimeout(() => {
                        this._router.navigate(['/master-data/list-of-unit-measure-setup'], {
                            relativeTo: this._activatedRoute
                        });
                        this.clearingSessionStorage();
                        console.log('this.isEditMode.', this.isEditMode);
                    }, 2000);
                }
            );
        } else {
            this.isValidate = false;
            this._snackBar.open('Fill all the mandatory fields.', 'Close', {
                duration: 1500,
                panelClass: ['snackbar-error']
            });
            return;
        }
    }
    // UPDATE UOM - UNIT OF MEASURE ENDS
    isDisabled = true;

    // UPDATE INSPECTION CHARACTERISTICS STARTS
    populateInspectionCharacteristicsData(data: any): void {
        if (!data) {
            console.error('NO DATA RECEIVED TO POPULATE THE FORM FIELDS.');
            return;
        }
        // MAPPING RESPONSE
        console.log(data);
        const formattedICHintCode =
            'ICH-' + this.rowDataICH.intCode.toString().padStart(5, '0');
        this.fourthFormGroup.patchValue({
            id: this.rowDataICH.id,
            intCode: formattedICHintCode,
            description: this.rowDataICH.description,
            singleCriteria: this.rowDataICH.singleCriteria,
            isActive: this.rowDataICH.isActive,
            type: this.rowDataICH.type,
        });
        const criteriaFormArray = this.fourthFormGroup.get(
            'qualitativeCriteriaObjects'
        ) as FormArray;

        // Iterate through `qualitativeCriteriaResultsObjects` and update existing descriptions
        this.rowDataICH.qualitativeCriteriaResultsObjects.forEach(
            (criteria: any, index: number) => {
                // Access each FormGroup inside the FormArray by index
                const criteriaGroup = criteriaFormArray.at(index) as FormGroup;

                // Update the description value for each criteria
                if (criteriaGroup) {
                    criteriaGroup.patchValue({
                        description: criteria.description,
                    });
                }
            }
        );
    }
    onUpdateICH(): void {
        this.isValidate = true
        if (this.fourthFormGroup.valid) {
            // console.log(this.fourthFormGroup.value);
            const formValues = this.fourthFormGroup.value;
            const { intCode, qualitativeCriteriaObjects, ...payload } = formValues; // EXCLUDING intCode, qualitativeCriteriaObjects
            // CHECKING VALIDATION FOR singleCriteria
            if (payload.type === 'qualitative' && !payload.singleCriteria?.trim()) {
                this.fourthFormGroup.get('singleCriteria')?.setErrors({ required: true });
                this.fourthFormGroup.get('singleCriteria')?.markAsTouched();
                this._snackBar.open('Criteria is required.', 'Close', {
                    duration: 1500,
                    panelClass: ['snackbar-error']
                });
                return;
            }
            if (payload.type === 'quantitative') {
                payload.singleCriteria = '';
            }
            // console.log('SENDING PAYLOAD:', payload);
            // return
            this._inspectionCharateristics
                .updateInspectionWithCriteria(payload)
                .subscribe(
                    (response) => {
                        if (response.isRequestSuccess) {
                            console.log('API RUN SUCCESSFULLY.', payload);
                            this._snackBar.open('Record Updated Successfully.', 'Close', {
                                duration: 1500,
                                panelClass: ['snackbar-error']
                            });
                            this._router.navigate(['/master-data/list-of-inspection-management'], { relativeTo: this._activatedRoute });
                            this.clearingSessionStorage();
                            console.log('this.isEditMode.', this.isEditMode);
                        } else {
                            console.error(
                                'REQUEST FAILED. ERROR WHILE UPDATING INSPECTION CHARACTERISTIC.',
                                response.message
                            );
                        }
                    },
                    (error) => {
                        console.error('API REQUEST FAILED:', error);
                    }
                );
        }
        else {
            this.isValidate = false
            this._snackBar.open('Fill all the mandatory fields.', 'Close', {
                duration: 1500,
                panelClass: ['snackbar-error']
            });
            return;
        }
    }
    // UPDATE INSPECTION CHARACTERISTICS ENDS

    //Updating Inspection Card

    // UPDATE IC - INSPECTION CARD STARTS
    // UPDATE INSPECTION CARD STARTS
    populateICData(data: any): void {
        if (!data) {
            console.error('NO DATA RECEIVED TO POPULATE THE FORM FIELDS.');
            return;
        }
        // MAPPING RESPONSE
        console.log(data);
        const formattedICintCode =
            'IC-' + this.rowDataIC.intCode.toString().padStart(5, '0');
        this.fifthFormGroup.patchValue({
            id: this.rowDataIC.id,
            intCode: formattedICintCode,
            description: this.rowDataIC.description,
            isActive: this.rowDataIC.isActive,
        });
    }

    // Updating Inspection Card Data: Starts
    onUpdateInspectionCard(): void {
        console.log('UPDATED FORM VALUES:', this.fifthFormGroup.value);
        const formValues = this.fifthFormGroup.value;

        const { description, qualitativeTableCriteria, quantitativeTableCriteria, ...restFormValues } = formValues;

        // ✅ Validation: Description, At least one qualitative and one quantitative characteristic required
        const hasDescription = description && description.trim().length > 0; // ✅ Description should not be empty
        const hasQualitative = qualitativeTableCriteria.length > 0;
        const hasQuantitative = quantitativeTableCriteria.length > 0;

        if (!hasDescription || !hasQualitative || !hasQuantitative) {
            let errorMessage = 'Please fill all required fields:\n';
            if (!hasDescription) errorMessage += '- Description is required.\n';
            if (!hasQualitative) errorMessage += '- At least one qualitative characteristic is required.\n';
            if (!hasQuantitative) errorMessage += '- At least one quantitative characteristic is required.\n';

            this._snackBar.open(errorMessage, 'Close', {
                duration: 4000,
                panelClass: ['snackbar-error']
            });
            return;
        }

        // ✅ Sare characteristics le aao (jaise add ke waqt karte ho)
        this._inspectionCharateristics.getInspectionCharacteristics().subscribe((charResponse) => {
            const mappedIds = charResponse.data.map((char: any) => ({
                description: char.description,
                id: char.id,
            }));

            // ✅ Sirf naye qualitative IDs
            const newQualitativeIds = this.qualitativeTableCriteria.controls
                .filter((group) => !group.get('id')?.value) // Jinki id nahi hai, wo new hai
                .map((group) => {
                    const desc = group.get('parameter')?.value;
                    return mappedIds.find((char) => char.description === desc)?.id;
                })
                .filter(Boolean);

            // ✅ Sirf naye quantitative IDs
            const newQuantitativeIds = this.quantitativeTableCriteria.controls
                .filter((group) => !group.get('id')?.value) // Jinki id nahi hai, wo new hai
                .map((group) => {
                    const desc = group.get('parameterX')?.value;
                    return mappedIds.find((char) => char.description === desc)?.id;
                })
                .filter(Boolean);

            // ✅ Sirf new added IDs
            const currentCharacteristicIds = [...newQualitativeIds, ...newQuantitativeIds];
            console.log('✅ Only New Characteristic IDs:', currentCharacteristicIds);

            // ✅ Purani jo edit ke waqt thi
            const existingCharacteristicIds = this.rowDataIC.characteristicsIds || [];

            // ✅ Jo delete hogayi hai
            const detachInspectionCharacteristicIds = existingCharacteristicIds.filter(
                (id) =>
                    !this.qualitativeTableCriteria.controls.some((group) => group.get('id')?.value === id) &&
                    !this.quantitativeTableCriteria.controls.some((group) => group.get('id')?.value === id)
            );

            const payload = {
                id: restFormValues.id,
                description: description.trim(),
                isActive: restFormValues.isActive,
                characteristicsIds: currentCharacteristicIds, // ✅ Sirf naye wale
                detachInspectionCharacteristicIds, // ✅ Jo delete hue
            };

            console.log('✅ Final Update Payload:', payload);

            this._inspectionCardUpdate.UpdateInspectionCard(payload).subscribe(
                (response) => {
                    if (response.isRequestSuccess) {
                        console.log('✅ API RUN SUCCESSFULLY.', payload);
                        this._snackBar.open('Record Updated Successfully.', 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-error']
                        });
                        this._router.navigate(['/master-data/list-of-inspection-card'], { relativeTo: this._activatedRoute });
                        this.clearingSessionStorage();
                        console.log('this.isEditMode.', this.isEditMode);
                    } else {
                        console.error('❌ ERROR WHILE UPDATING DATA.', response.message);
                    }
                },
                (error) => {
                    console.error('❌ API request failed:', error);
                    this._snackBar.open('Something went wrong while updating!', 'Close', {
                        duration: 3000,
                        panelClass: ['snackbar-error']
                    });
                }
            );
        });
    }


    // Updating Inspection Card Data: Ends

    // UPDATE ITEM INSPECTION CARD STARTS
    populateIICData(data: any): void {
        if (!data) {
            console.error('NO DATA RECEIVED TO POPULATE THE IIC FORM FIELDS.');
            return;
        }
        // MAPPING RESPONSE
        // console.log(data);
        const formattedCardintCode =
            'IC-' + this.rowDataIIC.inspectionCardIntCode.toString().padStart(5, '0');
        this.itemsInspectionCardsForm.patchValue({
            id: this.rowDataIIC.id,
            itemCode: this.rowDataIIC.itemCode,
            itemDescription: this.rowDataIIC.itemDescription,
            cardDescription: this.rowDataIIC.cardDescription,
            inspectionCardId: this.rowDataIIC.inspectionCardId,
            intCode: formattedCardintCode,
        });
    }

    loadBothCharacteristicsx(itemInspectionCardId: string): void {
        this._itemInspectionCardService
            .getBothCharacteristicsByItemInspectionCard(itemInspectionCardId)
            .subscribe(
                (res) => {
                    if (res.isRequestSuccess && res.data) {
                        const data = res.data;

                        // First, clear existing FormArrays
                        this.qualitativeInspectionObjects.clear();
                        this.quantitativeInspectionObjects.clear();

                        // Populate QUALITATIVE data
                        data.qualitativeInspectionObjects.forEach(
                            (qualitative) => {
                                this.qualitativeInspectionObjects.push(
                                    this.fb.group({
                                        inspectionCharacteristicId: [
                                            qualitative.inspectionCharacteristicId,
                                            Validators.required,
                                        ],
                                        isMandatory: [qualitative.isMandatory],
                                        qualitativeResultPassStatusObjects:
                                            this.fb.array(
                                                qualitative.qualitativeResultPassStatusResults.map(
                                                    (passStatus) =>
                                                        this.fb.group({
                                                            qualitativeResultId:
                                                                [
                                                                    passStatus.qualitativeResultId,
                                                                    Validators.required,
                                                                ],
                                                            isPassed: [
                                                                passStatus.isPassed,
                                                            ],
                                                        })
                                                )
                                            ),
                                        qualitativeResultFailStatusObjects:
                                            this.fb.array(
                                                qualitative.qualitativeResultFailStatusResults.map(
                                                    (failStatus) =>
                                                        this.fb.group({
                                                            qualitativeResultId:
                                                                [
                                                                    failStatus.qualitativeResultId,
                                                                    Validators.required,
                                                                ],
                                                            isPassed: [
                                                                failStatus.isPassed,
                                                            ],
                                                        })
                                                )
                                            ),
                                    })
                                );
                            }
                        );

                        // Populate QUANTITATIVE data
                        data.quantitativeInspectionResults.forEach(
                            (quantitative) => {
                                this.quantitativeInspectionObjects.push(
                                    this.fb.group({
                                        inspectionCharacteristicId: [
                                            quantitative.inspectionCharacteristicId,
                                            Validators.required,
                                        ],
                                        isMandatory: [quantitative.isMandatory],
                                        uoMId: [
                                            quantitative.uoMId,
                                            Validators.required,
                                        ],
                                        uoMCode: [
                                            quantitative.uoMCode,
                                        ],
                                        target: [
                                            quantitative.target,
                                            Validators.required,
                                        ],
                                        max: [
                                            quantitative.max,
                                            Validators.required,
                                        ],
                                        min: [
                                            quantitative.min,
                                            Validators.required,
                                        ],
                                    })
                                );
                            }
                        );

                        console.log(
                            '✅ Qualitative Loaded:',
                            this.qualitativeInspectionObjects.value
                        );
                        console.log(
                            '✅ Quantitative Loaded:',
                            this.quantitativeInspectionObjects.value
                        );
                    } else {
                        console.error('❌ No characteristics data found.');
                    }
                },
                (error) =>
                    console.error(
                        '❌ Error loading both characteristics',
                        error
                    )
            );
    }
    // UPDATE ITEM INSPECTION CARD STARTS
    loadBothCharacteristics(itemInspectionCardId: string): void {
        this._itemInspectionCardService
            .getBothCharacteristicsByItemInspectionCard(itemInspectionCardId)
            .subscribe(
                (res) => {
                    if (res.isRequestSuccess && res.data) {
                        const data = res.data;

                        // Clear existing FormArrays
                        this.qualitativeInspectionObjects.clear();
                        this.quantitativeInspectionObjects.clear();

                        // Populate QUALITATIVE FormArray
                        data.qualitativeInspectionObjects.forEach((qualitative) => {
                            // Get pass and fail descriptions from the single array
                            const passDescriptions = qualitative.qualitativeResultPassStatusResults
                                .filter((item) => item.isPassed)
                                .map((item) => item.resultDescription || '')
                                .join(', ');

                            const failDescriptions = qualitative.qualitativeResultPassStatusResults
                                .filter((item) => !item.isPassed)
                                .map((item) => item.resultDescription || '')
                                .join(', ');

                            this.qualitativeInspectionObjects.push(
                                this.fb.group({
                                    id: [qualitative.id, Validators.required],
                                    qualitativeInspectionId: [qualitative.qualitativeInspectionId ?? null], // ✅ FIXED: Save characteristicId
                                    parameter: [qualitative.inspectionCharacteristicName, Validators.required],
                                    passCriteria: [qualitative.inspectionCharacteristicSingleCriteria, Validators.required],
                                    mandatory: [qualitative.isMandatory],
                                    pass: [passDescriptions], // ✅ Extracted from isPassed=true
                                    fail: [failDescriptions], // ✅ Extracted from isPassed=false
                                    qualitativeResultPassStatusObjects: this.fb.array(
                                        qualitative.qualitativeResultPassStatusResults.map((status) =>
                                            this.fb.group({
                                                qualitativeResultId: [status.qualitativeResultId, Validators.required],
                                                isPassed: [status.isPassed],
                                                resultDescription: [status.resultDescription || ''],
                                            })
                                        )
                                    ),
                                })
                            );
                        });

                        // Populate QUANTITATIVE FormArray
                        data.quantitativeInspectionResults.forEach((quantitative) => {
                            this.quantitativeInspectionObjects.push(
                                this.fb.group({
                                    id: [quantitative.id, Validators.required],
                                    characteristicId: [quantitative.quantitativeInspectionId ?? null], // ✅ FIXED: Save characteristicId
                                    parameterQty: [quantitative.inspectionCharacteristicName, Validators.required],
                                    uoMId: [quantitative.uoMId, Validators.required],
                                    uoMCode: [quantitative.uoMCode],
                                    mandatoryQty: [quantitative.isMandatory],
                                    passCriteriaTarget: [quantitative.target, Validators.required],
                                    passCriteriaMax: [quantitative.max, Validators.required],
                                    passCriteriaMin: [quantitative.min, Validators.required],
                                })
                            );
                        });

                        // ✅ Update MatTableDataSource after populating FormArrays
                        if (!this.dataSourceQualitativeInspection) {
                            this.dataSourceQualitativeInspection = new MatTableDataSource<qualitativeInspectionIF>([]);
                        }
                        if (!this.dataSourceQuantitativeInspection) {
                            this.dataSourceQuantitativeInspection = new MatTableDataSource<quantitativeInspectionIF>([]);
                        }

                        // Assign FormArray values to dataSources
                        this.dataSourceQualitativeInspection.data = this.qualitativeInspectionObjects.value;
                        this.dataSourceQuantitativeInspection.data = this.quantitativeInspectionObjects.value;

                        console.log('✅ Qualitative Loaded:', this.qualitativeInspectionObjects.value);
                        console.log('✅ Quantitative Loaded:', this.quantitativeInspectionObjects.value);
                    } else {
                        console.error('❌ No characteristics data found.');
                    }
                },
                (error) => console.error('❌ Error loading both characteristics', error)
            );
    }

    XonUpdateItemInspectionCard(): void {
        console.log('UPDATED IIC FORM VALUES:', this.itemsInspectionCardsForm.value);
        const formValue = this.itemsInspectionCardsForm.value;

        // Ensure qualitativeInspectionObjects is properly initialized
        const qualitativeInspectionObjects = formValue.qualitativeInspectionObjects && Array.isArray(formValue.qualitativeInspectionObjects)
            ? formValue.qualitativeInspectionObjects.map((item: any) => ({
                id: item.id,
                qualitativeInspectionId: item.qualitativeInspectionId,
                isActive: true,
                isMandatory: item.mandatory,
                qualitativeResultPassStatusResults: item.qualitativeResultPassStatusObjects ? item.qualitativeResultPassStatusObjects.map((result: any) => ({
                    qualitativeResultId: result.qualitativeResultId,
                    isPassed: result.isPassed,
                })) : [],
                qualitativeResultFailStatusResults: item.qualitativeResultFailStatusObjects ? item.qualitativeResultFailStatusObjects.map((result: any) => ({
                    qualitativeResultId: result.qualitativeResultId,
                    isPassed: result.isPassed,
                })) : [],
            }))
            : [];

        // Ensure quantitativeInspectionObjects is properly initialized
        const quantitativeInspectionObjects = formValue.quantitativeInspectionObjects && Array.isArray(formValue.quantitativeInspectionObjects)
            ? formValue.quantitativeInspectionObjects.map((item: any) => ({
                id: item.id,
                quantitiveInspectionId: item.characteristicId ?? null,
                isActive: true,
                isMandatory: item.mandatoryQty,
                uoMId: item.uoMId,
                uoMCode: item.uoMCode,
                target: item.passCriteriaTarget ? parseFloat(item.passCriteriaTarget) : null,
                max: item.passCriteriaMax ? parseFloat(item.passCriteriaMax) : null,
                min: item.passCriteriaMin ? parseFloat(item.passCriteriaMin) : null,
            }))
            : [];

        // Creating the request body for the PUT request
        const putRequestBodyIIC = {
            id: formValue.id,
            isActive: true,
            qualitativeInspectionResults: qualitativeInspectionObjects,
            quantitativeInspectionResults: quantitativeInspectionObjects,
        };

        console.log("Final API Request Body:", putRequestBodyIIC);
        return;

        this._itemInspectionCardService
            .onUpdateItemInspectionCardBothCharacteristics(putRequestBodyIIC)
            .subscribe(
                (response) => {
                    if (response.isRequestSuccess) {
                        console.log('API RUN SUCCESSFULLY.', putRequestBodyIIC);
                        // setTimeout(() => {
                        //     this._router.navigate(
                        //         ['/master-data/list-of-items-inspection-cards'],
                        //         { relativeTo: this._activatedRoute }
                        //     );
                        // }, 1500);
                    } else {
                        console.error(
                            'ERROR WHILE UPDATING ITEM INSPECTION CARD.',
                            response.message
                        );
                    }
                },
                (error) => {
                    console.error('API REQUEST FAILED:', error);
                }
            );
    }
    onUpdateItemInspectionCard(): void {
        console.log('✅ FORM RAW VALUES:', this.itemsInspectionCardsForm.value);

        const formValue = this.itemsInspectionCardsForm.value;

        // ENSURE qualitativeInspectionObjects IS PROPERLY INITIALIZED
        const qualitativeInspectionObjects = formValue.qualitativeInspectionObjects && Array.isArray(formValue.qualitativeInspectionObjects)
            ? formValue.qualitativeInspectionObjects.map((item: any) => {
                console.log("🔍 Processing qualitative item:", item);

                const qualitativeResultPassStatusResults = item.qualitativeResultPassStatusObjects
                    ? item.qualitativeResultPassStatusObjects.map((result: any) => {
                        console.log("✅ qualitativeResultPassStatus BEFORE TRANSFORMATION:", result);

                        const transformedResult = {
                            qualitativeResultId: result.qualitativeResultId ?? null,
                            isPassed: result.isPassed ?? false,
                        };

                        console.log("✅ TRANSFORMED qualitativeResultPassStatus:", transformedResult);

                        return transformedResult;
                    })
                    : [];

                console.log("✅ FINAL qualitativeResultPassStatusResults:", qualitativeResultPassStatusResults);

                return {
                    id: item.id ?? null,
                    qualitativeInspectionId: item.qualitativeInspectionId ?? null,
                    isActive: true,
                    isMandatory: item.mandatory ?? false,
                    qualitativeResultPassStatusResults: qualitativeResultPassStatusResults,
                    qualitativeResultFailStatusResults: item.qualitativeResultFailStatusObjects
                        ? item.qualitativeResultFailStatusObjects.map((result: any) => ({
                            qualitativeResultId: result.qualitativeResultId ?? null,
                            isPassed: result.isPassed ?? false,
                        }))
                        : [],
                };
            })
            : [];

        console.log("✅ FINAL qualitativeInspectionObjects:", qualitativeInspectionObjects);

        // ENSURE quantitativeInspectionObjects IS PROPERLY INITIALIZED
        const quantitativeInspectionObjects = formValue.quantitativeInspectionObjects && Array.isArray(formValue.quantitativeInspectionObjects)
            ? formValue.quantitativeInspectionObjects.map((item: any) => ({
                id: item.id ?? null,
                quantitiveInspectionId: item.characteristicId ?? null,
                isActive: true,
                isMandatory: item.mandatoryQty ?? false,
                uoMId: item.uoMId ?? '',
                uoMCode: item.uoMCode ?? '',
                target: item.passCriteriaTarget !== undefined ? parseFloat(item.passCriteriaTarget) : null,
                max: item.passCriteriaMax !== undefined ? parseFloat(item.passCriteriaMax) : null,
                min: item.passCriteriaMin !== undefined ? parseFloat(item.passCriteriaMin) : null,
            }))
            : [];

        console.log("✅ FINAL quantitativeInspectionObjects:", quantitativeInspectionObjects);

        // CREATING THE REQUEST BODY FOR THE PUT (UpdateItemInspectionCard) API
        const putRequestBodyIIC = {
            id: formValue.id ?? null,
            isActive: true,
            qualitativeInspectionResults: qualitativeInspectionObjects,
            quantitativeInspectionResults: quantitativeInspectionObjects,
        };

        console.log("🚀 FINAL API REQUEST BODY:", putRequestBodyIIC);

        this._itemInspectionCardService
            .onUpdateItemInspectionCardBothCharacteristics(putRequestBodyIIC)
            .subscribe(
                (response) => {
                    console.log('✅ API RESPONSE:', response);

                    if (response.isRequestSuccess) {
                        console.log('🎉 API RUN SUCCESSFULLY.', putRequestBodyIIC);
                        this._snackBar.open('Record Updated Successfully.', 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-error']
                        });
                        setTimeout(() => {
                            this._router.navigate(['/master-data/list-of-items-inspection-cards'], { relativeTo: this._activatedRoute });
                        }, 1400);
                        setTimeout(() => {
                            this.clearingSessionStorage();
                            console.log('this.isEditMode.', this.isEditMode);
                        }, 1500);
                    } else {
                        console.error('❌ ERROR WHILE UPDATING ITEM INSPECTION CARD:', response.message);
                    }
                },
                (error) => {
                    console.error('❌ API REQUEST FAILED:', error);
                }
            );
    }







    //Close The Dialog Box

    closeDialog(): void {
        this.dialog.closeAll();
    }
    // UPDATE IC - INSPECTION CARD ENDS


    // UPDATE ITEM SAMPLE STARTS
    populateItemSampleFormData(data: any): void {
        if (!data) {
            console.error('NO DATA RECEIVED TO POPULATE THE FORM FIELDS.');
            // return;
        }
        // MAPPING RESPONSE 
        console.log(data);
        // return;
        const formattedISintCode = "IS-" + this.rowDataIS.intCode.toString().padStart(5, '0');
        this.itemSamplingForm.patchValue({
            sampleCodeIS: formattedISintCode,
            itemCode: this.rowDataIS.itemCode,
            itemDescription: this.rowDataIS.itemDescription,
            itemId: this.rowDataIS.itemId,
            flexibility: this.rowDataIS.flexibility,
            isActive: this.rowDataIS.isActive,
            id: this.rowDataIS.id,
        });

    }
    getSamplingRangeBySampleId(id: string): void {
        this._itemSamplesService.getSamplingRangeObjects(id).subscribe(
            (results) => {
                if (results.isRequestSuccess && results.data.length) {
                    const samplingRangeObjects = results.data[0].samplingRangeObjects;
                    // console.log('FETCHED SAMPLING RANGE OBJECTS');
                    // console.log(samplingRangeObjects);

                    this.initialSamplingRangeObjects = [...samplingRangeObjects]; // STORE THE INITIAL samplingRangeObjects VALUES
                    this.samplingRangeObjects.clear();

                    // ADDING EACH FETCHED samplingRangeObject TO THE FormArray
                    samplingRangeObjects.forEach((object) => {
                        const itemSamplingFormGroup = this.fb.group({
                            id: [object.id],
                            lotSizeMin: [object.lotSizeMin],
                            lotSizeMax: [object.lotSizeMax],
                            sampleQty: [object.sampleQty],
                            criticalDefects: [object.criticalDefects],
                            majorDefects: [object.majorDefects],
                            minorDefects: [object.minorDefects],
                        });
                        this.samplingRangeObjects.push(itemSamplingFormGroup); // Add to FormArray
                    });

                    // UPDATING THE MatTableDataSource WITH THE NEW FormArray VALUES
                    this.dataSourceItemSampling.data = this.samplingRangeObjects.value;
                } else {
                    console.error('NO SAMPLING RANGE OBJECTS FOUND.');
                }
            },
            (error) => console.error('ERROR WHILE FETCHING SAMPLING RANGE OBJECTS', error)
        );
    }

    validatingSamplingRange: string = '';
    onUpdateIS(): void {
        this.isValidate = true;
        this.validatingSamplingRange = '';

        if (this.itemSamplingForm.valid) {
            const formValues = this.itemSamplingForm.value;
            const { sampleCodeIS, itemCode, itemId, itemDescription, samplingRangeObjects, ...payload } = formValues;
            const initialSamplingRangeObjects = this.initialSamplingRangeObjects;

            // TRACK INVALID ROWS TO UPDATE
            let invalidRowFound = false;

            const updatedSamplingRangeObjects = samplingRangeObjects
                .filter((object: any, index: number) => {
                    const initialObject = initialSamplingRangeObjects[index];

                    // IF initialObject DOESN'T EXIST, IT'S A NEW ROW.
                    if (!initialObject) {
                        return true; // NEW OBJECT 
                    }

                    // CHECK IF ANY FIELD IS DIFFERENT BETWEEN THE CURRENT AND INITIAL OBJECT
                    return (
                        object.lotSizeMin !== initialObject.lotSizeMin ||
                        object.lotSizeMax !== initialObject.lotSizeMax ||
                        object.sampleQty !== initialObject.sampleQty ||
                        object.criticalDefects !== initialObject.criticalDefects ||
                        object.majorDefects !== initialObject.majorDefects ||
                        object.minorDefects !== initialObject.minorDefects
                    );
                })
                .map((object: any) => {
                    // SKIP ROWS WHERE lotSizeMin, lotSizeMax, or sampleQty ARE INVALID OR MISSING
                    if (
                        object.lotSizeMin == null || object.lotSizeMin === '' ||
                        object.lotSizeMax == null || object.lotSizeMax === '' ||
                        object.sampleQty == null || object.sampleQty === ''
                    ) {
                        invalidRowFound = true;

                        // ADD SPECIFIC VALIDATION MESSAGE FOR EACH FIELD
                        if (object.lotSizeMin == null || object.lotSizeMin === '') {
                            this.validatingSamplingRange = 'Lot Size Min is required. ';
                        }
                        if (object.lotSizeMax == null || object.lotSizeMax === '') {
                            this.validatingSamplingRange += 'Lot Size Max is required. ';
                        }
                        if (object.sampleQty == null || object.sampleQty === '') {
                            this.validatingSamplingRange += 'Sample Qty is required. ';
                        }
                        this.isValidate = false;
                        return null; // SKIP INVALID ROWS
                    }

                    // CONVERT TO NUMBERS FOR VALIDATION
                    const lotSizeMin = Number(object.lotSizeMin);
                    const lotSizeMax = Number(object.lotSizeMax);
                    const sampleQty = Number(object.sampleQty);
                    // VALIDATION: lotSizeMin < lotSizeMax
                    if (lotSizeMin >= lotSizeMax) {
                        this.validatingSamplingRange = 'Lot Size Min must be less than Lot Size Max.';
                        this.isValidate = false;
                        return null;
                    }
                    // VALIDATION: sampleQty STRICTLY BETWEEN lotSizeMin & lotSizeMax
                    if (sampleQty < lotSizeMin || sampleQty > lotSizeMax) {
                        this.validatingSamplingRange = 'Sample Qty must be within the bounds of Lot Size Min and Lot Size Max.';
                        this.isValidate = false;
                        return null;
                    }

                    // RETURN VALID OBJECT
                    return {
                        id: object.id || undefined,
                        lotSizeMin: lotSizeMin,
                        lotSizeMax: lotSizeMax,
                        sampleQty: sampleQty,
                        criticalDefects: object.criticalDefects,
                        majorDefects: object.majorDefects,
                        minorDefects: object.minorDefects
                    };
                })
                .filter((object: any) => object !== null); // REMOVE NULL ROWS

            // VALIDATION: OVERLAPPING RANGES
            for (let i = 0; i < updatedSamplingRangeObjects.length; i++) {
                const range = updatedSamplingRangeObjects[i];
                for (let j = 0; j < i; j++) {
                    const prevRange = updatedSamplingRangeObjects[j];
                    if (range.lotSizeMin <= prevRange.lotSizeMax) {
                        this.validatingSamplingRange = 'The defined sampling ranges must not overlap.'; //  'Ranges cannot overlap with existing'
                        this.isValidate = false;
                        this._snackBar.open(this.validatingSamplingRange, 'Close', {
                            duration: 3000,
                            panelClass: ['snackbar-error']
                        });
                        return;
                    }
                }
            }

            // IF NO VALID ROWS OR VALIDATION FAILED
            if (updatedSamplingRangeObjects.length === 0 || !this.isValidate) {
                this.isValidate = false;
                const errorMessage = this.validatingSamplingRange || 'No changes were made in Ranges. Redirecting to the main screen.';
                this._snackBar.open(errorMessage, 'Close', {
                    duration: 2050,
                    panelClass: ['snackbar-error']
                });
                if (!this.validatingSamplingRange) {
                    setTimeout(() => {
                        this._router.navigate(['/master-data/list-of-items-samples'], { relativeTo: this._activatedRoute });
                    }, 2000);
                    this.clearingSessionStorage();
                }
                return;
            }

            const sendingPayloadIS = {
                ...payload,
                samplingRangeObjects: updatedSamplingRangeObjects,
                id: formValues.id
            };
            console.log('SENDING FINAL PAYLOAD IS:', sendingPayloadIS);

            this._itemSamplesService.updateItemSample(sendingPayloadIS).subscribe(
                (response) => {
                    if (response.isRequestSuccess) {
                        console.log('API run successfully.', sendingPayloadIS);
                        this._snackBar.open('Record Updated Successfully.', 'Close', {
                            duration: 1500,
                            panelClass: ['snackbar-success']
                        });
                        setTimeout(() => {
                            this._router.navigate(['/master-data/list-of-items-samples'], { relativeTo: this._activatedRoute });
                        }, 1500);
                        this.clearingSessionStorage();
                    } else {
                        console.log('API RESPONSE (NON-ERROR):', response);
                    }
                },
                (error) => {
                    console.error('API request failed:', error);
                    console.log('API ERROR RESPONSE:', error.error);
                    let errorMessage = 'Error while updating data.';
                    if (error.error) {
                        if (error.error.exception?.[`samplingRangeObjects[0]`]?.length) {
                            errorMessage = error.error.exception[`samplingRangeObjects[0]`][0];
                        } else if (error.error.exception?.samplingRangeObjects?.length) {
                            errorMessage = error.error.exception.samplingRangeObjects[0];
                        } else if (error.error.message) {
                            errorMessage = error.error.message; // "Ranges cannot overlap with existing"
                        }
                    }
                    this._snackBar.open(errorMessage, 'Close', {
                        duration: 3000,
                        panelClass: ['snackbar-error']
                    });
                }
            );
        } else {
            // this.isValidate = false;
            this._snackBar.open('Fill all the mandatory fields with valid values.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
            return;
        }
    }
    // UPDATE ITEM SAMPLE ENDS

    // CLEARING SESSION STORAGE
    clearingSessionStorage(): void {
        sessionStorage.removeItem('stepperDataQR');
        sessionStorage.removeItem('stepperDataUOM');
        sessionStorage.removeItem('stepperDataICH');
        sessionStorage.removeItem('stepperDataIC');
        sessionStorage.removeItem('stepperDataIS');
        sessionStorage.removeItem('stepperDataIIC');
        this.isEditMode = false;
    }

    onNextClickQR(): void {
        const descriptionValue = this.firstFormGroup.get('resultDescription')?.value;
        const isDescriptionEmpty = !descriptionValue; // CHECKING IF resultDescription IS null, undefined, OR empty

        if (isDescriptionEmpty) {
            this.stepper.next(); // IF IS null, undefined, OR empty, MOVE TO NEXT
        } else {
            this._snackBar.open('Save or clear the data before moving to the next step.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
        }
    }
    onNextClickUOM(): void {
        const uomCodeValue = this.secondFormGroup.get('uoMCode')?.value;
        const descriptionValue = this.secondFormGroup.get('description')?.value;
        const isUoMCodeEmpty = !uomCodeValue; // CHECKING IF IS null, undefined, OR empty
        const isDescriptionEmpty = !descriptionValue; // CHECKING IF IS null, undefined, OR empty

        if (isDescriptionEmpty && isUoMCodeEmpty) {
            this.stepper.next(); // IF IS null, undefined, OR empty, MOVE TO NEXT
        } else {
            this._snackBar.open('Save or clear the data before moving to the next step.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
        }
    }
    onNextClickCharacteristics(): void {
        const descriptionValue = this.fourthFormGroup.get('description')?.value;
        const singleCriteriaValue = this.fourthFormGroup.get('singleCriteria')?.value;
        const isDescriptionEmpty = !descriptionValue; // CHECKING IF IS null, undefined, OR empty
        const isSingleCriteriaEmpty = !singleCriteriaValue; // CHECKING IF IS null, undefined, OR empty

        if (isDescriptionEmpty && isSingleCriteriaEmpty) {
            this.stepper.next(); // IF IS null, undefined, OR empty, MOVE TO NEXT
        } else {
            this._snackBar.open('Save or clear the data before moving to the next step.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
        }
    }
    onNextClickCards(): void {
        const descriptionValue = this.fifthFormGroup.get('description')?.value;
        const qualitativeCriteriaValue = this.fifthFormGroup.get('qualitativeTableCriteria')?.value as { parameter: string }[];
        const quantitativeCriteriaValue = this.fifthFormGroup.get('quantitativeTableCriteria')?.value as { parameterX: string }[];

        // CHECK IF EMPTY OR HAVE DATA
        const isDescriptionEmpty = !descriptionValue || descriptionValue.trim() === ''; // Null, undefined, or empty string
        const isQualitativeCriteriaEmpty = !qualitativeCriteriaValue ||
            qualitativeCriteriaValue.every(row => !row.parameter || row.parameter.trim() === '');
        const isQuantitativeCriteriaEmpty = !quantitativeCriteriaValue ||
            quantitativeCriteriaValue.every(row => !row.parameterX || row.parameterX.trim() === '');

        // CHECK IF ARRAYS OR DESCRIPTION HAVE NON-EMPTY DATA
        const hasQualitativeCriteria = qualitativeCriteriaValue &&
            qualitativeCriteriaValue.some(row => row.parameter && row.parameter.trim() !== '');
        const hasQuantitativeCriteria = quantitativeCriteriaValue &&
            quantitativeCriteriaValue.some(row => row.parameterX && row.parameterX.trim() !== '');
        const hasDescription = descriptionValue && descriptionValue.trim() !== '';

        if (isDescriptionEmpty && isQualitativeCriteriaEmpty && isQuantitativeCriteriaEmpty) {
            this.stepper.next();
        } else if (hasQualitativeCriteria || hasQuantitativeCriteria || hasDescription) {
            this._snackBar.open('Save or clear the data before moving to the next step.', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error']
            });
        }
    }
}
