import { CommonModule } from '@angular/common';
import {AfterViewInit,Component,ViewChild,ViewEncapsulation,inject,} from '@angular/core';
import {FormArray,FormBuilder,FormGroup,FormsModule,ReactiveFormsModule,Validators} from '@angular/forms';
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
// import {
//     qualitativeInspectionIF,
//     quantitativeInspectionIF,
// } from '../list-of-items-inspection-cards/items-inspection-cards/items-inspection-cards-interface';
import { ItemSamplesService } from 'app/core/other-core-services/module/item-sample.service';
import { SelectionModel } from '@angular/cdk/collections';
import { QualitativeResultsService } from 'app/core/other-core-services/module/qualitative-results.service';
import { UomMasterService } from 'app/core/other-core-services/module/uom-master.service';
import { InspectionCharacteristicsService } from 'app/core/other-core-services/module/inspection-characteristics.service';

interface itemSamplingRangeIF {
    lotSizeMin: number;
    lotSizeMax: number;
    sampleQty: number;
    criticalDefects: number;
    majorDefects: number;
    minorDefects: number;
}

export interface qualitativeInspectionIF {
    parameter: string;
    passCriteria: string;
    mandatory: boolean;
    pass: string;
    fail: string;
}

export interface quantitativeInspectionIF {
    parameterQty: string;
    uoMIdX: string;
    mandatoryQty: boolean;
    passCriteriaTarget: string;
    passCriteriaMax: string;
    passCriteriaMin: string;
}

@Component({
    selector: 'app-testing-stepper',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatButtonModule,
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatRadioModule,
        CommonModule,
        MatTableModule,
        MatTabsModule,
        MatIconModule,  
    ],
    animations: qbsAnimations,
    templateUrl: './testing-stepper.component.html',
    styleUrl: './testing-stepper.component.scss',
    
})
export class TestingStepperComponent implements AfterViewInit {


    // private _formBuilder = inject(FormBuilder);
    dataSourceItemCodeIS!: MatTableDataSource<any>;
    private _activatedRoute = inject(ActivatedRoute);


    unitOfMeasureLOV: any = [];

    constructor(
        private _formBuilder: FormBuilder,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private _itemSamplesService: ItemSamplesService,
        private _uommasterservice: UomMasterService,
        private _inspectionCharateristics: InspectionCharacteristicsService,
        private _qualitativeResultsService: QualitativeResultsService,
    ) { }
    qualitativeData = [
        { parameter: 'Sample Parameter 1' }, // Initial row
        { parameter: 'Sample Parameter 2' },
    ];
    displayedColumns: string[] = ['parameter'];
    firstRowAdded: boolean = false;

    @ViewChild(MatStepper) stepper!: MatStepper; // Correctly reference the MatStepper instance

    firstFormGroup = this._formBuilder.group({
        // firstCtrl: ['', Validators.required],
        resultDescription: ['', Validators.required],
    });
    secondFormGroup = this._formBuilder.group({
        uoMCode: ['', Validators.required],
        description: ['', Validators.required],
    });

    // ITEM SAMPLE

    itemSamplingForm = this._formBuilder.group({
        sampleCodeIS: ['', Validators.required],
        itemId: ['', Validators.required],
        itemDescription: ['', Validators.required],
        flexibility: [false],
        itemCode: ['', Validators.required],
        samplingRangeObjects: this._formBuilder.array([]),
    });

    displayedColumnsItemSamplingRange = [
        'lotSizeMin',
        'lotSizeMax',
        'sampleSize',
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
            lotSizeMin: [''],
            lotSizeMax: [''],
            sampleSize: [''],
            criticalDefects: [''],
            majorDefects: [''],
            minorDefects: [''],
        });
        // this.samples.push(itemSamplingFormGroup); // Add a new FormGroup to FormArray
        // this.dataSourceItemSampling.data = [...this.samples.value]; // Update the table data source
        this.samplingRangeObjects.push(itemSamplingFormGroup); // Add a new FormGroup to FormArray
        this.dataSourceItemSampling.data = [...this.samplingRangeObjects.value]; // Update the table data source

    }

      // ITEM SAMPLE ITEM CODE NG TEMPLATE STARTS
      @ViewChild('dialogTemplateItemCodeIS') dialogTemplateItemCodeIS;
      onItemSampleItemCodeClick() {
          const dialogRef = this.dialog.open(this.dialogTemplateItemCodeIS, {
              width: '80%',
              height: '75vh',
              data: this.dataSourceItemCodeIS,
          });
          dialogRef.afterClosed().subscribe(result => {
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
      selectedItemDescriptionIS: string = '';
      // 
      onRowCheckboxChangeItemCodeIS(selectedRow: any): void {
          this.dataSourceItemCodeIS.data.forEach(row => (row.isSelected = false));
          selectedRow.isSelected = true;
      }
      // 
      addSelectedRowItemCodeIS(): void {
          this.dialog.closeAll();
          const selectedRow = this.dataSourceItemCodeIS.data.find(row => row.isSelected);
          if (selectedRow) {
              this.itemSamplingForm.get('itemCode').setValue(selectedRow.itemCode);
              this.itemSamplingForm.get('itemId').setValue(selectedRow.id);
              this.itemSamplingForm.get('itemDescription').setValue(selectedRow.name);
  
              this.selectedIntCodeIS = selectedRow.intCode;
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
            width: '75%',
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
        intCode: [''],
        description: ['', Validators.required],
        isActive:[false],
        type: ['', Validators.required],
        qualitativeCriteriaObjects: this._formBuilder.array([]),
    });
    fifthFormGroup = this._formBuilder.group({
        cardCode: ['', Validators.required],
        cardDescription: ['', Validators.required],
        isActivefifth: [false],
        qualitativeTableCriteria: this._formBuilder.array([]),
        quantitativeTableCriteria: this._formBuilder.array([]), // Quantitative Data
    });

    // ITEM INSPECTION CARD 3.1 STARTS
    itemsInspectionForm = this._formBuilder.group({
        firstCtrl: ['', Validators.required],
        descriptionCtrl: ['', Validators.required],
        itemCode: ['', Validators.required],
        itemDescription: ['', Validators.required],
        cardCode: ['', Validators.required],
        cardDescription: ['', Validators.required],
        qualitativeArry: this.fb.array([]),
        quantitativeArry: this.fb.array([]),
    });
    displayedColumnsQualitative = [
        'parameter',
        'passCriteria',
        'mandatory',
        'pass',
        'fail',
    ];
    displayedColumnsQuantitative = [
        'parameterQty',
        'uoMIdX',
        'mandatoryQty',
        'passCriteriaTarget',
        'passCriteriaMax',
        'passCriteriaMin',
    ];
    qualitativeInspectionItems: qualitativeInspectionIF[] = [
        {
            parameter: 'Color Shade',
            passCriteria: 'As per standard',
            mandatory: false,
            pass: '',
            fail: '',
        },
        {
            parameter: 'Dental Damage',
            passCriteria: 'Essential',
            mandatory: false,
            pass: '',
            fail: '',
        },
    ];
    quantitativeInspectionItems: quantitativeInspectionIF[] = [
        {
            parameterQty: 'Color Shade',
            uoMIdX: '',
            mandatoryQty: false,
            passCriteriaTarget: '',
            passCriteriaMax: '',
            passCriteriaMin: '',
        },
        {
            parameterQty: 'Dental Damage',
            uoMIdX: '',
            mandatoryQty: false,
            passCriteriaTarget: '',
            passCriteriaMax: '',
            passCriteriaMin: '',
        },
    ];
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
        const formArrayQualitative = this.qualitativeArry;
        this.qualitativeInspectionItems.forEach((qualitativeItem) => {
            formArrayQualitative.push(
                this.fb.group({
                    parameter: [qualitativeItem.parameter],
                    passCriteria: [qualitativeItem.passCriteria],
                    mandatory: [qualitativeItem.mandatory], //  Checkbox bound here
                    pass: [qualitativeItem.pass],
                    fail: [qualitativeItem.fail],
                })
            );
        });
        // QUANTITATIVE INSPECTION FormArray
        const formArrayQuantitative = this.quantitativeArry;
        this.quantitativeInspectionItems.forEach((quantitativeItem) => {
            formArrayQuantitative.push(
                this.fb.group({
                    parameterQty: [quantitativeItem.parameterQty],
                    uoMIdX: [quantitativeItem.uoMIdX],
                    mandatoryQty: [quantitativeItem.mandatoryQty], //  Checkbox bound here
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
    // QUALITATIVE  -   ITEM INSPECTION CARD 3.1
    get qualitativeArry(): FormArray {
        return this.itemsInspectionForm.get('qualitativeArry') as FormArray;
    }
    // QUANTITATIVE -   ITEM INSPECTION CARD 3.1
    get quantitativeArry(): FormArray {
        return this.itemsInspectionForm.get('quantitativeArry') as FormArray;
    }
    addQualitativeInspectionRow(description: string, criteria: string): void {
        const qualitativeFormGroup = this.fb.group({
            parameter: [description], // Set selectedInspectionDescription
            passCriteria: [criteria], // Set selectedInspectionCriteria
            mandatory: [false],
            pass: [''],
            fail: [''],
        });

        this.qualitativeArry.push(qualitativeFormGroup); // Add a new FormGroup to FormArray
        this.dataSourceQualitativeInspection.data = [
            ...this.qualitativeArry.value,
        ];
    }
    addQuantitativeInspectionRow(description: string): void {
        const quantitativeInspectionFormGroup = this.fb.group({
            parameterQty: [description],
            uoMIdX: [''],
            mandatoryQty: [false],
            passCriteriaTarget: [''],
            passCriteriaMax: [''],
            passCriteriaMin: [''],
        });

        this.quantitativeArry.push(quantitativeInspectionFormGroup); // Add a new FormGroup to FormArray
        this.dataSourceQuantitativeInspection.data = [
            ...this.quantitativeArry.value,
        ];
    }
    // ITEM CODE NG TEMPLATE
    @ViewChild('dialogTemplateItemInspectionCardItems')
    dialogTemplateItemInspectionCardItems;
    dataSourceItemInspectionCardItems = new MatTableDataSource([
        {
            itemId: 1,
            itemCode: 'ITM0012561',
            itemDescription: 'Paint Bucket 3KG',
            itemGroup: 'Item Group A',
            isSelected: false,
        },
        {
            itemId: 2,
            itemCode: 'ITM0012562',
            itemDescription: 'Paint Bucket 5KG',
            itemGroup: 'Item Group B',
            isSelected: false,
        },
    ]);
    onItemInspectionCardCodeClick() {
        const dialogRef = this.dialog.open(
            this.dialogTemplateItemInspectionCardItems,
            {
                width: '75%',
                height: '75vh',
                data: this.dataSourceItemInspectionCardItems,
            }
        );
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsItemInspectionCardItems: string[] = [
        'itemCode',
        'itemDescription',
        'itemGroup',
    ];
    selectedItemCodeItemInspectionCardItemCode: string = '';
    selectedItemCodeItemInspectionCardItemDescription: string = '';
    onRowCheckboxChangeItemInspectionCardItems(selectedRow: any): void {
        this.dataSourceItemInspectionCardItems.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }
    addSelectedRowItemInspectionCardItem(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceItemInspectionCardItems.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            this.itemsInspectionForm
                .get('itemCode')
                .setValue(selectedRow.itemCode);
            this.itemsInspectionForm
                .get('itemDescription')
                .setValue(selectedRow.itemDescription);
            this.selectedItemCodeItemInspectionCardItemCode =
                selectedRow.itemCode;
            this.selectedItemCodeItemInspectionCardItemDescription =
                selectedRow.itemDescription;
            console.log('SELECTED ROW:', selectedRow);
        } else {
            console.log('NO ROW SELECTED');
        }
    }
    applyFilterItemInspectionCardItems(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceItemInspectionCardItems.filter = filterValue
            .trim()
            .toLowerCase();
    }
    // CARD CODE NG TEMPLATE STARTS
    @ViewChild('dialogTemplateCardsItemInspectionCard')
    dialogTemplateCardsItemInspectionCard;
    dataSourceCardsCardsItemInspectionCard = new MatTableDataSource([
        {
            cardCode: 'C001',
            cardDescription: 'Card Description C001',
            isSelected: false,
        },
        {
            cardCode: 'C002',
            cardDescription: 'Card Description C002',
            isSelected: false,
        },
    ]);
    onCardCodeClick() {
        const dialogRef = this.dialog.open(
            this.dialogTemplateCardsItemInspectionCard,
            {
                width: '75%',
                height: '75vh',
                data: this.dataSourceCardsCardsItemInspectionCard,
            }
        );
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsCards: string[] = ['cardCode', 'cardDescription'];
    selectedCardCode: string = '';
    selectedCardDescription: string = '';
    onRowCheckboxChangeCards(selectedRow: any): void {
        this.dataSourceCardsCardsItemInspectionCard.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }
    addSelectedRowCard(): void {
        this.dialog.closeAll();
        const selectedRow =
            this.dataSourceCardsCardsItemInspectionCard.data.find(
                (row) => row.isSelected
            );
        if (selectedRow) {
            this.itemsInspectionForm
                .get('cardCode')
                .setValue(selectedRow.cardCode);
            this.itemsInspectionForm
                .get('cardDescription')
                .setValue(selectedRow.cardDescription);
            this.selectedCardCode = selectedRow.cardCode;
            this.selectedCardDescription = selectedRow.cardDescription;
            console.log('SELECTED ROW:', selectedRow);
        } else {
            console.log('NO ROW SELECTED');
        }
    }
    applyFilterCards(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCardsCardsItemInspectionCard.filter = filterValue
            .trim()
            .toLowerCase();
    }
    // CARD CODE NG TEMPLATE ENDS

    // QUALITATIVE NG TEMPLATES
    // PASS NG TEMPLATE STARTS
    @ViewChild('dialogTemplatePass') dialogTemplatePass;
    dataSourcePass = new MatTableDataSource([
        { code: 'QR002', description: 'Moderate', isSelected: false },
        { code: 'QR003', description: 'Yes', isSelected: false },
    ]);
    selectedPassRowIndex: number = -1; // Store the clicked row index
    onPassClick(index: number) {
        this.selectedPassRowIndex = index; // Save index
        const dialogRef = this.dialog.open(this.dialogTemplatePass, {
            width: '75%',
            height: '75vh',
            data: this.dataSourcePass,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsPass: string[] = ['code', 'description'];
    selectedPassCode: string = '';
    selectedPassDescription: string = '';
    onRowCheckboxChangePass(selectedRow: any): void {
        this.dataSourcePass.data.forEach((row) => (row.isSelected = false));
        selectedRow.isSelected = true;
    }
    addSelectedRowPass(index: number): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourcePass.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            // Set value in the correct row of FormArray
            this.qualitativeArry.controls[index]
                .get('pass')
                ?.setValue(selectedRow.description);
            // Store selected values for debugging
            this.selectedPassCode = selectedRow.code;
            this.selectedPassDescription = selectedRow.description;
            console.log('SELECTED ROW:', selectedRow);
        } else {
            console.log('NO ROW SELECTED');
        }
    }
    // FAIL NG TEMPLATE STARTS
    @ViewChild('dialogTemplateFail') dialogTemplateFail;

    dataSourceFail = new MatTableDataSource([
        { code: 'QR001', description: 'Pathetic', isSelected: false },
        { code: 'QR004', description: 'No', isSelected: false },
    ]);
    onFailClick(index: number) {
        this.selectedFailRowIndex = index; // Save index
        const dialogRef = this.dialog.open(this.dialogTemplateFail, {
            width: '75%',
            height: '75vh',
            data: this.dataSourceFail,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsFail: string[] = ['code', 'description'];
    selectedFailCode: string = '';
    selectedFailDescription: string = '';
    onRowCheckboxChangeFail(selectedRow: any): void {
        this.dataSourceFail.data.forEach((row) => (row.isSelected = false));
        selectedRow.isSelected = true;
    }
    selectedFailRowIndex: number = -1; // Store the clicked row index
    addSelectedRowFail(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceFail.data.find(
            (row) => row.isSelected
        );
        if (selectedRow && this.selectedFailRowIndex !== -1) {
            // Set value in the correct row of FormArray
            this.qualitativeArry.controls[this.selectedFailRowIndex]
                .get('fail')
                ?.setValue(selectedRow.description);
            // Store selected values for debugging
            this.selectedFailCode = selectedRow.code;
            this.selectedFailDescription = selectedRow.description;
            console.log('SELECTED ROW:', selectedRow);
        } else {
            console.log('NO ROW SELECTED OR INVALID INDEX');
        }
    }
    // QUANTITATIVE INSPECTION NG TEMPLATES
    // UOM NG TEMPLATE STARTS
    @ViewChild('dialogTemplateUoM') dialogTemplateUoM;
    dataSourceUoM = new MatTableDataSource([
        { code: 'KG', description: 'Kilogram', isSelected: false },
        { code: 'GM', description: 'Gram', isSelected: false },
        { code: 'LTR', description: 'Liter', isSelected: false },
        { code: 'ML', description: 'Millilitre', isSelected: false },
    ]);
    selectedRowIndexUoM: number = -1; // Store the clicked row index
    onUoMQtyClick(index: number) {
        this.selectedRowIndexUoM = index; //  Save index
        const dialogRef = this.dialog.open(this.dialogTemplateUoM, {
            width: '75%',
            height: '75vh',
            data: this.dataSourceUoM,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsUoM: string[] = ['code', 'description'];
    selectedUoMCode: string = '';
    selectedUoMDescription: string = '';
    onRowCheckboxChangeUoM(selectedRow: any): void {
        this.dataSourceUoM.data.forEach((row) => (row.isSelected = false));
        selectedRow.isSelected = true;
    }
    addSelectedRowUoM(index: number): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceUoM.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            //  Set value in the correct row of FormArray
            this.quantitativeArry.controls[index]
                .get('uoMIdX')
                ?.setValue(selectedRow.code);
            //  Store selected values for debugging
            this.selectedUoMCode = selectedRow.code;
            this.selectedUoMDescription = selectedRow.description;
            console.log('SELECTED ROW:', selectedRow);
        } else {
            console.log('NO ROW SELECTED');
        }
    }
    // ADD QUALITATIVE INSPECTION NG TEMPLATE STARTS
    @ViewChild('dialogTemplateAddQualitative') dialogTemplateAddQualitative;
    dataSourceAddQualitative = new MatTableDataSource([
        {
            inspectionCode: 'T001',
            inspectionDescription: 'Color Shade',
            inspectionCriteria: 'As per standard',
            isSelected: false,
        },
        {
            inspectionCode: 'T002',
            inspectionDescription: 'Dental Damage',
            inspectionCriteria: 'Essential',
            isSelected: false,
        },
        {
            inspectionCode: 'T003',
            inspectionDescription: 'Parameter 3',
            inspectionCriteria: 'Criteria 3',
            isSelected: false,
        },
        {
            inspectionCode: 'T004',
            inspectionDescription: 'Parameter 4',
            inspectionCriteria: 'Criteria 4',
            isSelected: false,
        },
    ]);
    onAddQualitativeClick() {
        const dialogRef = this.dialog.open(this.dialogTemplateAddQualitative, {
            width: '75%',
            height: '75vh',
            data: this.dataSourceAddQualitative,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsAddQualitative: string[] = [
        'inspectionCode',
        'inspectionDescription',
        'inspectionCriteria',
    ];
    selectedInspectionDescription: string = '';
    selectedInspectionCriteria: string = '';
    onRowCheckboxChangeAddQualitative(selectedRow: any): void {
        this.dataSourceAddQualitative.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }
    addSelectedRowAddQualitative(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceAddQualitative.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            // Set the selected values
            this.selectedInspectionDescription =
                selectedRow.inspectionDescription;
            this.selectedInspectionCriteria = selectedRow.inspectionCriteria;

            console.log('SELECTED ROW:', selectedRow);

            // Call addQualitativeInspectionRow and pass the selected values
            this.addQualitativeInspectionRow(
                this.selectedInspectionDescription,
                this.selectedInspectionCriteria
            );
        } else {
            console.log('NO ROW SELECTED');
        }
    }
    applyFilterAddQualitative(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceAddQualitative.filter = filterValue.trim().toLowerCase();
    }
    // ADD QUALITATIVE INSPECTION NG TEMPLATE ENDS
    // ADD QUANTITATIVE INSPECTION NG TEMPLATE STARTS
    @ViewChild('dialogTemplateAddQuantitative') dialogTemplateAddQuantitative;
    dataSourceAddQuantitative = new MatTableDataSource([
        {
            inspectionCode: 'T005',
            inspectionDescription: 'Bubbles',
            isSelected: false,
        },
    ]);
    onAddQuantitativeClick() {
        const dialogRef = this.dialog.open(this.dialogTemplateAddQuantitative, {
            width: '75%',
            height: '75vh',
            data: this.dataSourceAddQuantitative,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsAddQuantitative: string[] = [
        'inspectionCode',
        'inspectionDescription',
    ];
    selectedQualitativeDescription: string = '';
    onRowCheckboxChangeAddQuantitative(selectedRow: any): void {
        this.dataSourceAddQuantitative.data.forEach(
            (row) => (row.isSelected = false)
        );
        selectedRow.isSelected = true;
    }
    addSelectedRowAddQuantitative(): void {
        this.dialog.closeAll();
        const selectedRow = this.dataSourceAddQuantitative.data.find(
            (row) => row.isSelected
        );
        if (selectedRow) {
            // Set the selected values
            this.selectedQualitativeDescription =
                selectedRow.inspectionDescription;
            console.log('SELECTED ROW:', selectedRow);
            // Call addQuantitativeInspectionRow and pass the selected values
            this.addQuantitativeInspectionRow(
                this.selectedQualitativeDescription
            );
        } else {
            console.log('NO ROW SELECTED');
        }
    }
    applyFilterAddQuantitative(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceAddQuantitative.filter = filterValue
            .trim()
            .toLowerCase();
    }
    // ADD QUANTITATIVE INSPECTION NG TEMPLATE ENDS

    // ITEM INSPECTION CARD 3.1 ENDS
    isLinear = false;

    ngOnInit(): void {
        //
        this._inspectionCharateristics.getInspectionCharacteristicsCode().subscribe((inspectionCharacteristicCode) => {
  const x = inspectionCharacteristicCode.data;  // 13 mil raha hai
  console.log('Fetched Code:', x);  // Check for debugging

  if (x) {
    const fullCode = `ICH-000${x}`;  // Combine 'ICH - ' with the fetched code
    this.fourthFormGroup.get('intCode')?.setValue(fullCode);  // Set the combined value in the form
  }
});
        
        //  Item Sample
        this._itemSamplesService.getSampleCodeIS().subscribe((sampleCodeIS) => {
            const fetchedCodeIS = sampleCodeIS.data;
            console.log('FETCHED CODE:', fetchedCodeIS);
            if (fetchedCodeIS) {
                const formattedSampleCodeIS = `IS-000${fetchedCodeIS}`
                this.itemSamplingForm.get('sampleCodeIS')?.setValue(formattedSampleCodeIS);
            }
        });
        this.fetchListAllItems();
        this.addNewRowItemSampling();
        // ITEM INSPECTION CARD 3.1
        this.initializeTableDataItemInspectionCard();

        this.fourthFormGroup
            .get('type')
            ?.valueChanges.subscribe((value) => {
                if (value === 'qualitative') {
                    this.initializeQualitativeRow();
                } else {
                    this.clearQualitativeCriteria();
                }
            });

        this.initializeTableWithDefaultRow(); // Initialize table with one row on load
        this.initializeTableWithDefaultRowX(); // Initialize table with one row on load
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
                    this.dataSourceItemCodeIS = new MatTableDataSource(response.data);
                    console.log('FETCHED ITEMS:', this.dataSourceItemCodeIS.data);
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
        return this.fourthFormGroup.get('qualitativeCriteriaObjects') as FormArray;
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
    dataSourceItems = new MatTableDataSource([
        {
            itemId: 1,
            inspectionCode: 'ITM0012561',
            itemDescription: 'Paint Bucket 3KG',
            itemGroup: 'Item Group A',
            status: 'Active',
            isSelected: false,
        },
        {
            itemId: 2,
            inspectionCode: 'ITM0012562',
            itemDescription: 'Paint Bucket 5KG',
            itemGroup: '',
            status: 'In Active',
            isSelected: false,
        },
    ]);
    //
    selectedControlAccountRowIndex: number = -1;
    onItemCodeClick(rowIndex: number): void {
        console.log('Row Index:', rowIndex);
        this.selectedControlAccountRowIndex = rowIndex;
        console.log(this.selectedControlAccountRowIndex);
        const dialogRef = this.dialog.open(this.dialogTemplateItems, {
            width: '70%',
            height: '75vh',
            data: this.dataSourceItems,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsItems: string[] = [
        'inspectionCode',
        'itemDescription',
        'itemGroup',
        'status',
    ];
    selectedInspectionCode: string = '';
    selectedItemDescription: string = '';
    //
    onRowCheckboxChangeItems(selectedRow: any): void {
        this.dataSourceItems.data.forEach((row) => (row.isSelected = false));
        selectedRow.isSelected = true;
    }
    applyFilterItems(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceItems.filter = filterValue.trim().toLowerCase();
    }

    addSelectedRowItem(): void {
        this.dialog.closeAll();

        const selectedRow = this.dataSourceItems.data.find(
            (row) => row.isSelected
        );
        if (selectedRow && this.selectedControlAccountRowIndex !== -1) {
            const rowFormGroup = this.qualitativeTableCriteria.at(
                this.selectedControlAccountRowIndex
            ) as FormGroup;
            rowFormGroup
                .get('parameter')
                ?.setValue(selectedRow.itemDescription); // Set the value for this row's parameter
            this.selectedInspectionCode = selectedRow.inspectionCode;
            this.selectedItemDescription = selectedRow.itemDescription;

            console.log('SELECTED ROW:', selectedRow);
            console.log(
                'UPDATED ROW INDEX:',
                this.selectedControlAccountRowIndex
            );
        } else {
            console.log('NO ROW SELECTED');
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
    dataSourceItemsX = new MatTableDataSource([
        {
            itemId: 1,
            inspectionCode: 'ITM0012561',
            itemDescription: 'Paint Bucket 3KG',
            itemGroup: 'Item Group A',
            isSelected: false,
        },
        {
            itemId: 2,
            inspectionCode: 'ITM0012562',
            itemDescription: 'Paint Bucket 5KG',
            itemGroup: '',
            isSelected: false,
        },
    ]);

    onItemCodeClickX(rowIndex: number): void {
        this.selectedControlAccountRowIndex = rowIndex;
        const dialogRef = this.dialog.open(this.dialogTemplateItemsX, {
            width: '39%',
            height: '75vh',
            data: this.dataSourceItemsX,
        });
        dialogRef.afterClosed().subscribe(() => {
            console.log('Dialog closed');
        });
    }

    displayedColumnsItemsX: string[] = [
        'inspectionCode',
        'itemDescription',
        'itemGroup',
    ];

    onRowCheckboxChangeItemsX(selectedRow: any): void {
        this.dataSourceItemsX.data.forEach((row) => (row.isSelected = false));
        selectedRow.isSelected = true;
    }

    applyFilterItemsX(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceItemsX.filter = filterValue.trim().toLowerCase();
    }

    addSelectedRowItemX(): void {
        this.dialog.closeAll();

        const selectedRow = this.dataSourceItemsX.data.find(
            (row) => row.isSelected
        );
        if (selectedRow && this.selectedControlAccountRowIndex !== -1) {
            const rowFormGroup = this.quantitativeTableCriteria.at(
                this.selectedControlAccountRowIndex
            ) as FormGroup;
            rowFormGroup
                .get('parameterX')
                ?.setValue(selectedRow.itemDescription);

            console.log('Selected row:', selectedRow);
        }

        this.selectedControlAccountRowIndex = -1; // Reset index
    }

    // onSubmitQualitativeResult(): void {
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
        console.log('UPDATED FORM VALUES:', this.firstFormGroup.value);
        const formValues = this.firstFormGroup.value;
        const payload = {
          ...formValues,
      };
        this._qualitativeResultsService.AddQualitativeResult(payload).subscribe(
          (response) => {
              if (response.succeeded) {
                  console.log('API RUN SUCCESSFULLY.', payload);
              }
          }
      );
    }

    onSubmitUnitOfMeasure(): void {
        console.log('UPDATED FORM VALUES:', this.secondFormGroup.value);
        const formValues = this.secondFormGroup.value;
        const payload = {
          ...formValues,
      };
        this._uommasterservice.AddUnitOfMeasure(payload).subscribe(
          (response) => {
              if (response.succeeded) {
                  console.log('API RUN SUCCESSFULLY.', payload);
              }
          }
      );
    }

    onSubmitInspectionCharacteristics(): void {
        console.log('UPDATED FORM VALUES:', this.fourthFormGroup.value);
        const formValues = this.fourthFormGroup.value;
        const { intCode,  ...payload } = formValues; // EXCLUDING intCode
        console.log('UPDATED FORM VALUES:', payload);

        this._inspectionCharateristics.AddInspectionCharacteristics(payload).subscribe(
          (response) => {
              if (response.succeeded) {
                  console.log('API RUN SUCCESSFULLY.', payload);
              }
          }
      );
    }

    

      

    onSubmit(): void {
      if (this.fourthFormGroup.valid) {
        console.log('Form Submitted:', this.fourthFormGroup.value);
      } else {
        console.log('Form is invalid');
      }
    }

    onSubmititemSamplingForm(): void {
        if (this.itemSamplingForm.valid) {
            const formValues = this.itemSamplingForm.value;
            // const payload = { ...formValues, };
            const { itemCode, sampleCodeIS, ...payload } = formValues; // EXCLUDING itemCode & sampleCodeIS
            console.log('FORM SUBMISSION PAYLOAD:', payload);
            // this.itemSamplingForm.reset();
            this._itemSamplesService.AddSampleWithRanges(payload).subscribe(
                (response) => {
                    if (response.isRequestSuccess) {
                        console.log('API RUN SUCCESSFULLY.', payload);
                    } else {
                        console.error(
                            'ERROR WHILE ADDIND DATA.',
                            response.message
                        );
                    }
                }
            );

        } else {
            console.log('FORM IS INVALID!');
        }
    }

    closeDialog(): void {
        this.dialog.closeAll();
    }
}
