import { Component } from '@angular/core';
import { OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { qbsAnimations } from '@qbs/animations';
import { QbsCardComponent } from '@qbs/components/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { result } from 'lodash';
import { qualitativeInspectionIF, quantitativeInspectionIF } from '../items-inspection-cards-interface';

@Component({
  selector: 'app-add-items-inspection-cards',
  templateUrl: './add-items-inspection-cards.component.html',
  styleUrl: './add-items-inspection-cards.component.scss',
  standalone: true,
  imports: [
    AsyncPipe, CommonModule, FormsModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatSidenavModule, MatSortModule, MatSlideToggleModule, MatTableModule, MatTabsModule, MatTooltipModule, NgClass, NgTemplateOutlet, QbsCardComponent, QbsFindByKeyPipe, ReactiveFormsModule, RouterLink, RouterOutlet
  ],
  animations: qbsAnimations,
  encapsulation: ViewEncapsulation.None,
})

export class AddItemsInspectionCardsComponent implements OnInit {
  itemsInspectionForm: FormGroup;

  displayedColumnsQualitative = ['parameter', 'passCriteria', 'mandatory', 'pass', 'fail'];
  displayedColumnsQuantitative = ['parameterQty', 'uomQty', 'mandatoryQty', 'passCriteriaTarget', 'passCriteriaMax', 'passCriteriaMin'];

  qualitativeInspectionItems: qualitativeInspectionIF[] = [
    { parameter: 'Color Shade', passCriteria: 'As per standard', mandatory: false, pass: '', fail: '' },
    { parameter: 'Dental Damage', passCriteria: 'Essential', mandatory: false, pass: '', fail: '' }
  ];
  quantitativeInspectionItems: quantitativeInspectionIF[] = [
    { parameterQty: 'Color Shade', uomQty: '', mandatoryQty: false, passCriteriaTarget: '', passCriteriaMax: '', passCriteriaMin: '' },
    { parameterQty: 'Dental Damage', uomQty: '', mandatoryQty: false, passCriteriaTarget: '', passCriteriaMax: '', passCriteriaMin: '' },
  ];

  dataSourceQualitativeInspection = new MatTableDataSource<qualitativeInspectionIF>(this.qualitativeInspectionItems);
  dataSourceQuantitativeInspection = new MatTableDataSource<quantitativeInspectionIF>(this.quantitativeInspectionItems);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) {
    this.itemsInspectionForm = this.fb.group({
      itemCode: new FormControl(''),
      itemDescription: new FormControl(''),
      cardCode: new FormControl(''),
      cardDescription: new FormControl(''),
      // FormArray FOR DYNAMIC ROWS
      qualitativeArry: this.fb.array([]),
      quantitativeArry: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initializeTableDataItemInspectionCard();
  }

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
          uomQty: [quantitativeItem.uomQty],
          mandatoryQty: [quantitativeItem.mandatoryQty], //  Checkbox bound here
          passCriteriaTarget: [quantitativeItem.passCriteriaTarget],
          passCriteriaMax: [quantitativeItem.passCriteriaMax],
          passCriteriaMin: [quantitativeItem.passCriteriaMin],
        })
      );
    });
    // Convert formArray.controls to raw values for MatTableDataSource
    this.dataSourceQualitativeInspection.data = formArrayQualitative.value as qualitativeInspectionIF[];
    this.dataSourceQuantitativeInspection.data = formArrayQuantitative.value as quantitativeInspectionIF[];
  }

  // QUALITATIVE
  get qualitativeArry(): FormArray {
    return this.itemsInspectionForm.get('qualitativeArry') as FormArray;
  }
  // QUANTITATIVE
  get quantitativeArry(): FormArray {
    return this.itemsInspectionForm.get('quantitativeArry') as FormArray;
  }

  addQualitativeInspectionRow(description: string, criteria: string): void {
    const qualitativeFormGroup = this.fb.group({
      parameter: [description],  // Set selectedInspectionDescription
      passCriteria: [criteria],  // Set selectedInspectionCriteria
      mandatory: [false],
      pass: [''],
      fail: [''],
    });

    this.qualitativeArry.push(qualitativeFormGroup); // Add a new FormGroup to FormArray
    this.dataSourceQualitativeInspection.data = [...this.qualitativeArry.value];
  }

  addQuantitativeInspectionRow(description: string): void {
    const quantitativeInspectionFormGroup = this.fb.group({
      parameterQty: [description],
      uomQty: [''],
      mandatoryQty: [false],
      passCriteriaTarget: [''],
      passCriteriaMax: [''],
      passCriteriaMin: [''],
    });

    this.quantitativeArry.push(quantitativeInspectionFormGroup); // Add a new FormGroup to FormArray
    this.dataSourceQuantitativeInspection.data = [...this.quantitativeArry.value];
  }

  submitItemsInspectionForm(): void {
    if (this.itemsInspectionForm.valid) {
      const formValues = this.itemsInspectionForm.value;
      const payload = {
        ...formValues,
      };
      console.log('FORM SUBMISSION PAYLOAD:', payload);
      // this.itemsInspectionForm.reset();
    } else {
      console.log('FORM IS INVALID!');
    }
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }


  // ITEM CODE NG TEMPLATE
  @ViewChild('dialogTemplateItemInspectionCardItems') dialogTemplateItemInspectionCardItems;
  dataSourceItemInspectionCardItems = new MatTableDataSource([
    { itemId: 1, itemCode: 'ITM0012561', itemDescription: 'Paint Bucket 3KG', itemGroup: 'Item Group A', isSelected: false, },
    { itemId: 2, itemCode: 'ITM0012562', itemDescription: 'Paint Bucket 5KG', itemGroup: 'Item Group B', isSelected: false, },
  ]);

  onItemInspectionCardCodeClick() {
    const dialogRef = this.dialog.open(this.dialogTemplateItemInspectionCardItems, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceItemInspectionCardItems,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsItemInspectionCardItems: string[] = ['itemCode', 'itemDescription', 'itemGroup'];
  selectedItemCodeItemInspectionCardItemCode: string = '';
  selectedItemCodeItemInspectionCardItemDescription: string = '';

  onRowCheckboxChangeItemInspectionCardItems(selectedRow: any): void {
    this.dataSourceItemInspectionCardItems.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowItemInspectionCardItem(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceItemInspectionCardItems.data.find(row => row.isSelected);
    if (selectedRow) {
      this.itemsInspectionForm.get('itemCode').setValue(selectedRow.itemCode);
      this.itemsInspectionForm.get('itemDescription').setValue(selectedRow.itemDescription);
      this.selectedItemCodeItemInspectionCardItemCode = selectedRow.itemCode;
      this.selectedItemCodeItemInspectionCardItemDescription = selectedRow.itemDescription;
      console.log('SELECTED ROW:', selectedRow);
    } else {
      console.log('NO ROW SELECTED');
    }
  }

  applyFilterItemInspectionCardItems(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceItemInspectionCardItems.filter = filterValue.trim().toLowerCase();
  }

  // CARD CODE NG TEMPLATE STARTS
  @ViewChild('dialogTemplateCardsItemInspectionCard') dialogTemplateCardsItemInspectionCard;
  dataSourceCardsCardsItemInspectionCard = new MatTableDataSource([
    { cardCode: 'C001', cardDescription: 'Card Description C001', isSelected: false, },
    { cardCode: 'C002', cardDescription: 'Card Description C002', isSelected: false, },
  ]);

  onCardCodeClick() {
    const dialogRef = this.dialog.open(this.dialogTemplateCardsItemInspectionCard, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceCardsCardsItemInspectionCard,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsCards: string[] = ['cardCode', 'cardDescription'];
  selectedCardCode: string = '';
  selectedCardDescription: string = '';

  onRowCheckboxChangeCards(selectedRow: any): void {
    this.dataSourceCardsCardsItemInspectionCard.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowCard(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceCardsCardsItemInspectionCard.data.find(row => row.isSelected);
    if (selectedRow) {
      this.itemsInspectionForm.get('cardCode').setValue(selectedRow.cardCode);
      this.itemsInspectionForm.get('cardDescription').setValue(selectedRow.cardDescription);
      this.selectedCardCode = selectedRow.cardCode;
      this.selectedCardDescription = selectedRow.cardDescription;
      console.log('SELECTED ROW:', selectedRow);
    } else {
      console.log('NO ROW SELECTED');
    }
  }

  applyFilterCards(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceCardsCardsItemInspectionCard.filter = filterValue.trim().toLowerCase();
  }
  // CARD CODE NG TEMPLATE ENDS

  // QUALITATIVE NG TEMPLATES
  // PASS NG TEMPLATE STARTS
  @ViewChild('dialogTemplatePass') dialogTemplatePass;

  dataSourcePass = new MatTableDataSource([
    { code: 'QR002', description: 'Moderate', isSelected: false, },
    { code: 'QR003', description: 'Yes', isSelected: false, },
  ]);

  selectedPassRowIndex: number = -1; // Store the clicked row index

  onPassClick(index: number) {
    this.selectedPassRowIndex = index; // Save index
    const dialogRef = this.dialog.open(this.dialogTemplatePass, {
      width: '75%',
      height: '75vh',
      data: this.dataSourcePass,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsPass: string[] = ['code', 'description'];
  selectedPassCode: string = '';
  selectedPassDescription: string = '';

  onRowCheckboxChangePass(selectedRow: any): void {
    this.dataSourcePass.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowPass(index: number): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourcePass.data.find(row => row.isSelected);
    if (selectedRow) {
      // Set value in the correct row of FormArray
      this.qualitativeArry.controls[index].get('pass')?.setValue(selectedRow.description);
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
    { code: 'QR001', description: 'Pathetic', isSelected: false, },
    { code: 'QR004', description: 'No', isSelected: false, },
  ]);

  onFailClick(index: number) {
    this.selectedFailRowIndex = index; // Save index
    const dialogRef = this.dialog.open(this.dialogTemplateFail, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceFail,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsFail: string[] = ['code', 'description'];
  selectedFailCode: string = '';
  selectedFailDescription: string = '';

  onRowCheckboxChangeFail(selectedRow: any): void {
    this.dataSourceFail.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  selectedFailRowIndex: number = -1; // Store the clicked row index

  addSelectedRowFail(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceFail.data.find(row => row.isSelected);
    if (selectedRow && this.selectedFailRowIndex !== -1) {
      // Set value in the correct row of FormArray
      this.qualitativeArry.controls[this.selectedFailRowIndex].get('fail')?.setValue(selectedRow.description);
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
    { code: 'KG', description: 'Kilogram', isSelected: false, },
    { code: 'GM', description: 'Gram', isSelected: false, },
    { code: 'LTR', description: 'Liter', isSelected: false, },
    { code: 'ML', description: 'Millilitre', isSelected: false, },
  ]);
  selectedRowIndexUoM: number = -1; // Store the clicked row index

  onUoMQtyClick(index: number) {
    this.selectedRowIndexUoM = index; //  Save index
    const dialogRef = this.dialog.open(this.dialogTemplateUoM, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceUoM,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsUoM: string[] = ['code', 'description'];
  selectedUoMCode: string = '';
  selectedUoMDescription: string = '';

  onRowCheckboxChangeUoM(selectedRow: any): void {
    this.dataSourceUoM.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowUoM(index: number): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceUoM.data.find(row => row.isSelected);
    if (selectedRow) {
      //  Set value in the correct row of FormArray
      this.quantitativeArry.controls[index].get('uomQty')?.setValue(selectedRow.code);
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
    { inspectionCode: 'T001', inspectionDescription: 'Color Shade', inspectionCriteria: 'As per standard', isSelected: false, },
    { inspectionCode: 'T002', inspectionDescription: 'Dental Damage', inspectionCriteria: 'Essential', isSelected: false, },
    { inspectionCode: 'T003', inspectionDescription: 'Parameter 3', inspectionCriteria: 'Criteria 3', isSelected: false, },
    { inspectionCode: 'T004', inspectionDescription: 'Parameter 4', inspectionCriteria: 'Criteria 4', isSelected: false, },
  ]);

  onAddQualitativeClick() {
    const dialogRef = this.dialog.open(this.dialogTemplateAddQualitative, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceAddQualitative,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsAddQualitative: string[] = ['inspectionCode', 'inspectionDescription', 'inspectionCriteria'];
  selectedInspectionDescription: string = '';
  selectedInspectionCriteria: string = '';

  onRowCheckboxChangeAddQualitative(selectedRow: any): void {
    this.dataSourceAddQualitative.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowAddQualitative(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceAddQualitative.data.find(row => row.isSelected);
    if (selectedRow) {
      // Set the selected values
      this.selectedInspectionDescription = selectedRow.inspectionDescription;
      this.selectedInspectionCriteria = selectedRow.inspectionCriteria;

      console.log('SELECTED ROW:', selectedRow);

      // Call addQualitativeInspectionRow and pass the selected values
      this.addQualitativeInspectionRow(this.selectedInspectionDescription, this.selectedInspectionCriteria);
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
    { inspectionCode: 'T005', inspectionDescription: 'Bubbles', isSelected: false, },
  ]);

  onAddQuantitativeClick() {
    const dialogRef = this.dialog.open(this.dialogTemplateAddQuantitative, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceAddQuantitative,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsAddQuantitative: string[] = ['inspectionCode', 'inspectionDescription'];
  selectedQualitativeDescription: string = '';

  onRowCheckboxChangeAddQuantitative(selectedRow: any): void {
    this.dataSourceAddQuantitative.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowAddQuantitative(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceAddQuantitative.data.find(row => row.isSelected);
    if (selectedRow) {
      // Set the selected values
      this.selectedQualitativeDescription = selectedRow.inspectionDescription;

      console.log('SELECTED ROW:', selectedRow);

      // Call addQuantitativeInspectionRow and pass the selected values
      this.addQuantitativeInspectionRow(this.selectedQualitativeDescription);
    } else {
      console.log('NO ROW SELECTED');
    }
  }

  applyFilterAddQuantitative(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAddQuantitative.filter = filterValue.trim().toLowerCase();
  }
  // ADD QUANTITATIVE INSPECTION NG TEMPLATE ENDS

}
