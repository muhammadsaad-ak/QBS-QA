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
import { ItemInspectionCardService } from 'app/core/other-core-services/module/item-inspection-card.service';

interface RowData {
  id: string;
  parameter: string;
  passCriteria: string;
  mandatory: boolean;
  pass: string;
  fail: string;
}

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
  itemsInspectionCardsForm: FormGroup;

  displayedColumnsQualitative = ['parameter', 'passCriteria', 'mandatory', 'pass', 'fail', 'results'];
  displayedColumnsQuantitative = ['parameterQty', 'uoMId', 'mandatoryQty', 'passCriteriaTarget', 'passCriteriaMax', 'passCriteriaMin'];

  qualitativeInspectionItems: qualitativeInspectionIF[] = [];
  quantitativeInspectionItems: quantitativeInspectionIF[] = [];

  dataSourceQualitativeInspection = new MatTableDataSource<qualitativeInspectionIF>(this.qualitativeInspectionItems);
  dataSourceQuantitativeInspection = new MatTableDataSource<quantitativeInspectionIF>(this.quantitativeInspectionItems);

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _itemInspectionCardService: ItemInspectionCardService,
  ) {
    this.itemsInspectionCardsForm = this.fb.group({
      itemCode: new FormControl(''),
      itemDescription: new FormControl(''),
      intCode: new FormControl(''), // CARD CODE
      description: new FormControl(''), //  CARD DESCRIPTION
      id: new FormControl(''), //  CARD ID
      // FormArray FOR DYNAMIC ROWS
      qualitativeInspectionObjects: this.fb.array([]),
      quantitativeInspectionObjects: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initializeTableDataItemInspectionCard();
    this.fetchListAllItemsSAP();
    this.fetchListAllCards();

    // GET INSPECTION CHARACTERISTICS API
    this._itemInspectionCardService.getInspectionCharacteristicsIIC().subscribe();

    // INSPECTION CHARACTERISTICS API FOR BOTH  QUALITATIVE  &  QUANTITATIVE
    // API CALL TO GET INSPECTION CHARACTERISTICS WITH CRITERIA
    this._itemInspectionCardService.getInspectionCharacteristicsWithCriteria().subscribe((inspectionCardModal) => {
      const qualitativeData = inspectionCardModal.data.filter((item: any) => item.type === 'qualitative');
      const quantitativeData = inspectionCardModal.data.filter((item: any) => item.type === 'quantitative');

      qualitativeData.forEach((item: any) => {
        item.qualitativeCriteriaResultsObjects = item.qualitativeCriteriaResultsObjects || []; // Ensure it's always an array
        // Setting the first criteria's description
        item.criteriaDescription = item.qualitativeCriteriaResultsObjects.length > 0 ? item.qualitativeCriteriaResultsObjects[0].description : '';
      });

      this.dataSourceAddQualitativeIIC = new MatTableDataSource(qualitativeData);
      this.dataSourceAddQuantitativeIIC = new MatTableDataSource(quantitativeData);
    });

    // LIST ALL QUALITATIVE RESULTS
    this._itemInspectionCardService.ListAllQualitativeResultsIIC().subscribe((items) => {
      this.dataSourceQRIIC.data = items.data;
    });

    // UOM - UNIT OF MEASURE API
    this._itemInspectionCardService.getAllUnitOfMeasureIIC().subscribe((unitOfMeasure) => {
      this.dataSourceUoMIIC.data = unitOfMeasure.data;
    });

  }

  initializeTableDataItemInspectionCard(): void {
    // QUALITATIVE INSPECTION FormArray
    const formArrayQualitative = this.qualitativeInspectionObjects;
    this.qualitativeInspectionItems.forEach((qualitativeItem) => {
      formArrayQualitative.push(
        this.fb.group({
          parameter: [qualitativeItem.parameter],
          passCriteria: [qualitativeItem.passCriteria],
          mandatory: [qualitativeItem.mandatory],
          pass: [qualitativeItem.pass],
          fail: [qualitativeItem.fail],
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
          mandatoryQty: [quantitativeItem.mandatoryQty],
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
  get qualitativeInspectionObjects(): FormArray {
    return this.itemsInspectionCardsForm.get('qualitativeInspectionObjects') as FormArray;
  }
  // QUANTITATIVE
  get quantitativeInspectionObjects(): FormArray {
    return this.itemsInspectionCardsForm.get('quantitativeInspectionObjects') as FormArray;
  }

  addQualitativeInspectionRow(id: string, description: string, criteria: string): void {
    const qualitativeFormGroup = this.fb.group({
      id: [id],  // ✅ Including the ID
      parameter: [description],  // Set selectedQualitativeDescriptionIIC
      passCriteria: [criteria],  // Set selectedQualitativeCriteriaIIC
      mandatory: [false],
      pass: [''],
      fail: [''],
    });

    this.qualitativeInspectionObjects.push(qualitativeFormGroup); // Add a new FormGroup to FormArray
    this.dataSourceQualitativeInspection.data = [...this.qualitativeInspectionObjects.value];
  }

  addQuantitativeInspectionRow(id: string, description: string): void {
    const quantitativeInspectionFormGroup = this.fb.group({
      id: [id],  // ✅ Including the ID
      parameterQty: [description],
      uoMId: [''],
      mandatoryQty: [false],
      passCriteriaTarget: [''],
      passCriteriaMax: [''],
      passCriteriaMin: [''],
    });

    this.quantitativeInspectionObjects.push(quantitativeInspectionFormGroup); // Add a new FormGroup to FormArray
    this.dataSourceQuantitativeInspection.data = [...this.quantitativeInspectionObjects.value];


  }

  // ITEM CODE API
  fetchListAllItemsSAP(): void {
    this._itemInspectionCardService.getListAllItems().subscribe({
      next: (response) => {
        if (response && response.isRequestSuccess && response.data) {
          this.dataSourceItemCodeIIC = new MatTableDataSource(response.data);
          console.log('FETCHED ITEMS:', this.dataSourceItemCodeIIC.data);
        } else {
          console.warn('INVALID API RESPONSE:', response);
          this.dataSourceItemCodeIIC = new MatTableDataSource([]);
        }
      },
      error: (err) => {
        console.error('ERROR FETCHING ITEMS:', err);
      },
    });
  }
  // CARD CODE API
  fetchListAllCards(): void {
    this._itemInspectionCardService.ListAllInspectionCards().subscribe({
      next: (response) => {
        if (response && response.isRequestSuccess && response.data) {
          this.dataSourceCardCodeIIC = new MatTableDataSource(response.data);
          console.log('FETCHED CARDS:', this.dataSourceCardCodeIIC.data);
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

  // XsubmitItemsInspectionCardsForm(): void {
  //   if (this.itemsInspectionCardsForm.valid) {
  //     const formValues = this.itemsInspectionCardsForm.value;
  //     const payload = {
  //       ...formValues,
  //     };
  //     console.log('FORM SUBMISSION PAYLOAD:', payload);
  //     // this.itemsInspectionCardsForm.reset();
  //   } else {
  //     console.log('FORM IS INVALID!');
  //   }
  // }

  submitItemsInspectionCardsForm(): void {
    if (this.itemsInspectionCardsForm.valid) {
      const formValues = this.itemsInspectionCardsForm.value;
      console.log("🚀 ~ AddItemsInspectionCardsComponent ~ submitItemsInspectionCardsForm ~ formValues:", formValues)
      
      // Ensure qualitativeResultPassStatusObjects and qualitativeResultFailStatusObjects are correctly updated
      const updatedQualitativeInspectionObjects = formValues.qualitativeInspectionObjects.map((inspectionObject: any) => {
        // Find and update the pass/fail arrays
        const updatedPassObjects = this.qualitativeResultPassStatusObjects.filter(
          (passObj) => passObj.qualitativeResultId === inspectionObject.id
        );
        const updatedFailObjects = this.qualitativeResultFailStatusObjects.filter(
          (failObj) => failObj.qualitativeResultId === inspectionObject.id
        );
        
        console.log("🚀 ~ AddItemsInspectionCardsComponent ~ updatedQualitativeInspectionObjects ~ updatedPassObjects:", updatedPassObjects)
        console.log("🚀 ~ AddItemsInspectionCardsComponent ~ updatedQualitativeInspectionObjects ~ updatedFailObjects:", updatedFailObjects)
        // Update the inspection object with the correct pass/fail data
        return {
          ...inspectionObject,
          qualitativeResultPassStatusObjects: updatedPassObjects,
          qualitativeResultFailStatusObjects: updatedFailObjects
        };
      });

      const payload = {
        ...formValues,
        qualitativeInspectionObjects: updatedQualitativeInspectionObjects, // Ensure updated data is used
      };

      console.log('FORM SUBMISSION PAYLOAD:', payload);

      // Reset the form after submission if needed
      // this.itemsInspectionCardsForm.reset();
    } else {
      console.log('FORM IS INVALID!');
    }
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  dataSourceItemCodeIIC!: MatTableDataSource<any>;
  // ITEM CODE - ITEM INSPECTION CARD NG TEMPLATE STARTS
  @ViewChild('dialogTemplateItemCodeIIC') dialogTemplateItemCodeIIC;
  onItemCodeClickIIC() {
    const dialogRef = this.dialog.open(this.dialogTemplateItemCodeIIC, {
      width: '80%',
      height: '75vh',
      data: this.dataSourceItemCodeIIC,
    });
    dialogRef.afterClosed().subscribe(result => {
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
  // 
  onRowChangeItemCodeIIC(selectedRow: any): void {
    this.dataSourceItemCodeIIC.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  // 
  addSelectedRowItemCodeIIC(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceItemCodeIIC.data.find(row => row.isSelected);
    if (selectedRow) {
      this.itemsInspectionCardsForm.get('itemCode').setValue(selectedRow.itemCode);
      this.itemsInspectionCardsForm.get('itemDescription').setValue(selectedRow.name);

      this.selectedIntCodeIIC = selectedRow.intCode;
      this.selectedItemCodeIIC = selectedRow.itemCode;
      this.selectedItemDescriptionICC = selectedRow.name;

      console.log('SELECTED ROW:', selectedRow);
    } else {
      console.log('NO ROW SELECTED');
    }
  }
  applyFilterItemCodeIIC(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceItemCodeIIC.filter = filterValue.trim().toLowerCase();
  }
  // ITEM CODE - ITEM INSPECTION CARD NG TEMPLATE ENDS

  ListIAllCardsItemInspectionCard = [];

  // CARD CODE - ITEM INSPECTION CARD  NG TEMPLATE STARTS
  @ViewChild('dialogTemplateCardCodeIIC') dialogTemplateCardCodeIIC;
  // dataSourceCardCodeIIC = new MatTableDataSource<any>(this.ListIAllCardsItemInspectionCard);
  dataSourceCardCodeIIC = new MatTableDataSource<any>([]);

  onCardCodeClickIIC() {
    const dialogRef = this.dialog.open(this.dialogTemplateCardCodeIIC, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceCardCodeIIC,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsCards: string[] = ['cardCode', 'cardDescription', 'id'];
  selectedCardCode: string = '';
  selectedCardDescription: string = '';

  onRowChangeCardCodeIIC(selectedRow: any): void {
    this.dataSourceCardCodeIIC.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowCardCodeIIC(): void {
    this.dialog.closeAll();
    const selectedRowCardCodeIIC = this.dataSourceCardCodeIIC.data.find(row => row.isSelected);

    if (selectedRowCardCodeIIC) {
      this.itemsInspectionCardsForm.get('intCode').setValue(selectedRowCardCodeIIC.intCode);
      this.itemsInspectionCardsForm.get('description').setValue(selectedRowCardCodeIIC.description);
      this.itemsInspectionCardsForm.get('id').setValue(selectedRowCardCodeIIC.id);

      this.selectedCardCode = selectedRowCardCodeIIC.cardCode;
      this.selectedCardDescription = selectedRowCardCodeIIC.cardDescription;

      console.log('SELECTED ROW:', selectedRowCardCodeIIC);

      // Call API dynamically with the selected ID / inspectionCardId
      const inspectionCardId = selectedRowCardCodeIIC.id;
      this._itemInspectionCardService.getCardCharacteristicsDataByCardId(inspectionCardId).subscribe({
        next: (response) => {
          console.log('RECEIVED CHARACTERISTICS:', response);
          // Process the fetched data
          this.fetcheCardCharacteristicsByCardId(response.data);
        },
        error: (err) => console.error('ERROR FETCHING CHARACTERISTICS:', err)
      });
    } else {
      console.log('NO ROW SELECTED');
    }
  }

  applyFilterCardCodeIIC(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceCardCodeIIC.filter = filterValue.trim().toLowerCase();
  }

  fetcheCardCharacteristicsByCardId(characteristicsData: any): void {
    if (!characteristicsData || !characteristicsData.responseCharacteristicWithCriteria) {
      console.warn('No valid item data received.');
      return;
    }

    const qualitativeArray = this.qualitativeInspectionObjects;
    const quantitativeArray = this.quantitativeInspectionObjects;

    // CLEAR EXISTING FORM ARRAYS BEFORE ADDING NEW ONES
    qualitativeArray.clear();
    quantitativeArray.clear();

    characteristicsData.responseCharacteristicWithCriteria.forEach((characteristic: any) => {
      const type = characteristic.type.toLowerCase(); //  toLowerCase TO HANDLE BOTH qualitative OR Qualitative

      if (type === 'qualitative') {
        if (characteristic.qualitativeCriteriaResults.length > 0) {
          // Push a row for each qualitativeCriteriaResult
          characteristic.qualitativeCriteriaResults.forEach((criteria: any) => {
            qualitativeArray.push(this.fb.group({
              id: characteristic.id, // Assigning qualitative ID
              parameter: characteristic.description,
              passCriteria: criteria.description, // Assigning criteria individually
              mandatory: false,
              pass: '',
              fail: ''
            }));
          });
        }
        else {
          // Push a row even if there are no criteria results
          qualitativeArray.push(this.fb.group({
            id: characteristic.id, // Assigning qualitative ID
            parameter: characteristic.description,
            passCriteria: '',
            mandatory: false,
            pass: '',
            fail: ''
          }));
        }
      }
      else if (type === 'quantitative') {
        // Assigning quantitative ID
        quantitativeArray.push(this.fb.group({
          id: characteristic.id, // Assigning quantitative ID
          parameterQty: characteristic.description,
          uoMId: '',
          mandatoryQty: false,
          passCriteriaTarget: '',
          passCriteriaMax: '',
          passCriteriaMin: ''
        }));
      }
    });

    // Update data sources for the tables
    this.dataSourceQualitativeInspection.data = qualitativeArray.value;
    this.dataSourceQuantitativeInspection.data = quantitativeArray.value;

    console.log('UPDATED qualitativeArray:', this.dataSourceQualitativeInspection.data);
    console.log('UPDATED qualitativeArray:', this.dataSourceQuantitativeInspection.data);
  }
  // CARD CODE NG TEMPLATE ENDS

  // QUALITATIVE NG TEMPLATES




  // QUANTITATIVE INSPECTION NG TEMPLATES
  // UOM NG TEMPLATE STARTS
  @ViewChild('dialogTemplateUoMIIC') dialogTemplateUoMIIC;
  dataSourceUoMIIC = new MatTableDataSource([]);
  selectedRowIndexUoM: number = -1; // Store the clicked row index

  onUoMQtyClickIIC(index: number) {
    this.selectedRowIndexUoM = index; //  Save index
    const dialogRef = this.dialog.open(this.dialogTemplateUoMIIC, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceUoMIIC,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsUoMIIC: string[] = ['code', 'description'];
  selectedUoMCode: string = '';
  selectedUoMDescription: string = '';

  onRowChangeUoMIIC(selectedRow: any): void {
    this.dataSourceUoMIIC.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowUoMIIC(index: number): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceUoMIIC.data.find(row => row.isSelected);
    if (selectedRow) {
      //  Set value in the correct row of FormArray
      this.quantitativeInspectionObjects.controls[index].get('uoMId')?.setValue(selectedRow.id);
      //  Store selected values for debugging
      this.selectedUoMCode = selectedRow.uoMCode;
      this.selectedUoMDescription = selectedRow.description;
      console.log('SELECTED ROW:', selectedRow);
    } else {
      console.log('NO ROW SELECTED');
    }
  }

  // ADD QUALITATIVE INSPECTION NG TEMPLATE STARTS
  @ViewChild('dialogTemplateAddQualitativeIIC') dialogTemplateAddQualitativeIIC;
  dataSourceAddQualitativeIIC = new MatTableDataSource([]);

  onAddQualitativeClickIIC() {
    const dialogRef = this.dialog.open(this.dialogTemplateAddQualitativeIIC, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceAddQualitativeIIC,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsAddQualitativeIIC: string[] = ['inspectionCode', 'inspectionDescription', 'inspectionCriteria'];
  selectedQualitativeDescriptionIIC: string = '';
  selectedQualitativeCriteriaIIC: string = '';

  onRowChangeAddQualitativeIIC(selectedRow: any): void {
    this.dataSourceAddQualitativeIIC.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowQualitativeIIC(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceAddQualitativeIIC.data.find(row => row.isSelected);
    if (selectedRow) {
      // Set the selected values
      this.selectedQualitativeDescriptionIIC = selectedRow.description;
      this.selectedQualitativeCriteriaIIC = selectedRow.inspectionCriteria;

      // Check if criteriaDescription exists 
      const criteriaDescription = selectedRow.criteriaDescription || ''; // Default to empty if not available

      console.log('SELECTED ROW:', selectedRow);

      // Call addQualitativeInspectionRow and pass the selected values
      // this.addQualitativeInspectionRow(selectedRow.id, selectedRow.description, selectedRow.criteriaDescription);
      this.addQualitativeInspectionRow(selectedRow.id, selectedRow.description, criteriaDescription);
    } else {
      console.log('NO ROW SELECTED');
    }
  }

  applyFilterAddQualitativeIIC(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAddQualitativeIIC.filter = filterValue.trim().toLowerCase();
  }
  // ADD QUALITATIVE INSPECTION NG TEMPLATE ENDS

  // ADD QUANTITATIVE INSPECTION NG TEMPLATE STARTS
  @ViewChild('dialogTemplateAddQuantitativeIIC') dialogTemplateAddQuantitativeIIC;
  dataSourceAddQuantitativeIIC = new MatTableDataSource([]);

  onAddQuantitativeClickIIC() {
    const dialogRef = this.dialog.open(this.dialogTemplateAddQuantitativeIIC, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceAddQuantitativeIIC,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }

  displayedColumnsAddQuantitativeIIC: string[] = ['inspectionCode', 'inspectionDescription'];
  selectedQuantitativeDescriptionIIC: string = '';

  onRowChangeAddQuantitativeIIC(selectedRow: any): void {
    this.dataSourceAddQuantitativeIIC.data.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }

  addSelectedRowQuantitativeIIC(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceAddQuantitativeIIC.data.find(row => row.isSelected);
    if (selectedRow) {
      // Set the selected values
      this.selectedQuantitativeDescriptionIIC = selectedRow.description;

      console.log('SELECTED ROW:', selectedRow);

      // Call addQuantitativeInspectionRow and pass the selected values
      // this.addQuantitativeInspectionRow(this.selectedQuantitativeDescriptionIIC);
      this.addQuantitativeInspectionRow(selectedRow.id, selectedRow.description);
    } else {
      console.log('NO ROW SELECTED');
    }
  }

  applyFilterAddQuantitativeIIC(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceAddQuantitativeIIC.filter = filterValue.trim().toLowerCase();
  }
  // ADD QUANTITATIVE INSPECTION NG TEMPLATE ENDS




  // QR STARTS
  dataSourceQRIIC = new MatTableDataSource([]);
  @ViewChild('dialogTemplateResultsIIC') dialogTemplateResultsIIC;

  selectedRowIndexResults: number = -1; // Store the clicked row index

  selectedRowData: RowData;
  onResultsClickIIC(index: number, data: any) {

    this.selectedRowIndexResults = index; // Save index
    this.selectedRowData = data; // Save data

    console.log(this.selectedRowIndexResults);
    console.log(this.selectedRowData);
    console.log(this.selectedRowData.id);

    const dialogRef = this.dialog.open(this.dialogTemplateResultsIIC, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceQRIIC,
    });

    console.log(this.dataSourceQRIIC);

    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }


  displayedColumnsResultsIIC: string[] = ['id', 'code', 'description', 'criteria'];

  qualitativeResultPassStatusObjects: any[] = [];
  qualitativeResultFailStatusObjects: any[] = [];

  onSave(row: any): void {
    this.onCriteriaSelection(row)
    this.dialog.closeAll();



  }

  onCriteriaSelection(row: any): void {
    console.log('id:', row.id);
    console.log('Selected criteria:', row.criteria);

    // Ensure arrays exist before modification
    if (!this.qualitativeResultPassStatusObjects) this.qualitativeResultPassStatusObjects = [];
    if (!this.qualitativeResultFailStatusObjects) this.qualitativeResultFailStatusObjects = [];

    // Remove previous entry if it exists in pass/fail arrays
    this.qualitativeResultPassStatusObjects = this.qualitativeResultPassStatusObjects.filter(
      (obj) => obj.qualitativeResultId !== row.id
    );
    this.qualitativeResultFailStatusObjects = this.qualitativeResultFailStatusObjects.filter(
      (obj) => obj.qualitativeResultId !== row.id
    );

    // Add new entry to correct array (pass or fail)
    if (row.criteria === "true") {
      this.qualitativeResultPassStatusObjects.push({
        qualitativeResultId: row.id,
        isPassed: true
      });
    } else if (row.criteria === "false") {
      this.qualitativeResultFailStatusObjects.push({
        qualitativeResultId: row.id,
        isPassed: true
      });
    }

    // Now, we need to link the updated pass/fail objects to the correct qualitativeInspectionObject
    const formArray = this.itemsInspectionCardsForm.get('qualitativeInspectionObjects') as FormArray;

    console.log(formArray, '.............');

    if (!formArray) {
      console.warn('qualitativeInspectionObjects is undefined.');
      return;
    }

    // Find the correct qualitative inspection object based on inspectionCharacteristicId
    const inspectionIndex = formArray.controls.findIndex(
      (control) => control.value.inspectionCharacteristicId === row.inspectionCharacteristicId
    );

    if (inspectionIndex === -1) {
      console.warn('No matching qualitative inspection object found.');
      return;
    }

    // Get the specific FormGroup inside the FormArray
    const inspectionObject = formArray.at(inspectionIndex) as FormGroup;

    // Ensure qualitativeResultPassStatusObjects and qualitativeResultFailStatusObjects exist in the form control
    if (!inspectionObject.get('qualitativeResultPassStatusObjects')) {
      inspectionObject.addControl('qualitativeResultPassStatusObjects', new FormArray([]));
    }
    if (!inspectionObject.get('qualitativeResultFailStatusObjects')) {
      inspectionObject.addControl('qualitativeResultFailStatusObjects', new FormArray([]));
    }

    const passArray = inspectionObject.get('qualitativeResultPassStatusObjects') as FormArray;
    const failArray = inspectionObject.get('qualitativeResultFailStatusObjects') as FormArray;

    // Clear previous pass/fail selection for the given qualitativeResultId
    passArray.clear();
    failArray.clear();

    // Add new pass/fail values from the global arrays
    this.qualitativeResultPassStatusObjects.forEach((passObj) => {
      passArray.push(new FormControl(passObj));
    });

    this.qualitativeResultFailStatusObjects.forEach((failObj) => {
      failArray.push(new FormControl(failObj));
    });

    // Debugging logs to verify the payload
    console.log("Updated qualitativeInspectionObjects:", formArray.value);

  }

  


  applyFilterQRIIC(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceQRIIC.filter = filterValue.trim().toLowerCase();
  }


  onCriteriaChange(selectedRow: any) {
    // Find the matching row in qualitative table
    const qualitativeRow = this.dataSourceAddQualitativeIIC.data.find(row => row.id === selectedRow.id);

    if (qualitativeRow) {
      qualitativeRow.inspectionCriteria = selectedRow.criteria;
      this.dataSourceAddQualitativeIIC._updateChangeSubscription(); // Refresh table
    }
  }

  saveCriteriaSelection() {
    // Ensure form array length is equal to data length
    while (this.qualitativeInspectionObjects.length < this.dataSourceQRIIC.data.length) {
      this.qualitativeInspectionObjects.push(this.fb.group({ pass: [''], fail: [''] }));
    }

    // Debugging: Check length before processing
    console.log('🔍 Total Rows in dataSourceQRIIC:', this.dataSourceQRIIC.data.length);
    console.log('🔍 Total Form Controls:', this.qualitativeInspectionObjects.length);

    this.dataSourceQRIIC.data.forEach((row, index) => {
      let formGroup = this.qualitativeInspectionObjects.at(index) as FormGroup;

      if (!formGroup) {
        console.error(`❌ FormGroup missing at index ${index}`);
        return;
      }

      let passControl = formGroup.get('pass');
      let failControl = formGroup.get('fail');

      if (!passControl || !failControl) {
        console.error(`❌ Controls missing at index ${index}`);
        return;
      }

      console.log(`🔄 Processing Row ${index} -> ID: ${row.id}, Criteria: ${row.criteria}`);

      if (row.criteria === 'Pass') {
        passControl.setValue(row.resultDescription);
        failControl.setValue('');
      } else if (row.criteria === 'Fail') {
        failControl.setValue(row.resultDescription);
        passControl.setValue('');
      }

      console.log(
        `✅ Row ${index} Updated -> Pass: ${passControl.value}, Fail: ${failControl.value}`
      );
    });
  }

}
