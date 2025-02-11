import {Component, inject, ViewEncapsulation, ViewChild, AfterViewInit,OnInit } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormArray, FormGroup} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { MatTab } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepper } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';



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
  templateUrl: './testing-stepper.component.html',
  styleUrl: './testing-stepper.component.scss'
})
export class TestingStepperComponent implements AfterViewInit {
  // private _formBuilder = inject(FormBuilder);
  private _activatedRoute = inject(ActivatedRoute);
  constructor(private _formBuilder: FormBuilder, private dialog: MatDialog) {}
  qualitativeData = [
    { parameter: 'Sample Parameter 1' }, // Initial row
    { parameter: 'Sample Parameter 2' }];  
    displayedColumns: string[] = ['parameter'];
    firstRowAdded: boolean = false; 

  


  @ViewChild(MatStepper) stepper!: MatStepper;  // Correctly reference the MatStepper instance


  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
    descriptionCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    uomCodeCtrl: ['', Validators.required],
    uomNameCtrl: ['', Validators.required],

  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });
  fourthFormGroup = this._formBuilder.group({
    inspectionCodethird: ['', Validators.required],
    inspectionDescription: ['', Validators.required],
    inspectionType: ['', Validators.required],
    qualitativeCriteria: this._formBuilder.array([]),
  });
  fifthFormGroup = this._formBuilder.group({
    cardCode: ['', Validators.required],
    cardDescription: ['', Validators.required],
    isActivefifth: [false],
    qualitativeTableCriteria: this._formBuilder.array([]) ,
    quantitativeTableCriteria: this._formBuilder.array([])  // Quantitative Data
  });

  sixthFormGroup = this._formBuilder.group({
    iteminspectionCard: ['', Validators.required],
  });
  isLinear = false;

  ngOnInit(): void {
    
    this.fourthFormGroup.get('inspectionType')?.valueChanges.subscribe((value) => {
      if (value === 'qualitative') {
        this.initializeQualitativeRow();
      } else {
        this.clearQualitativeCriteria();
      }
    });

    this.initializeTableWithDefaultRow();  // Initialize table with one row on load
    this.initializeTableWithDefaultRowX();  // Initialize table with one row on load

  }

  ngAfterViewInit(): void {
    this._activatedRoute.queryParams.subscribe((params) => {
      const stepIndex = params['step'] ? +params['step'] : 0;
      Promise.resolve().then(() => this.stepper.selectedIndex = stepIndex);  // Ensure stepper is initialized
    });
  }
/** Getter for qualitativeCriteria FormArray */
  get qualitativeCriteria(): FormArray {
    return this.fourthFormGroup.get('qualitativeCriteria') as FormArray;
  }
  /** Initialize one row in qualitativeCriteria */
  initializeQualitativeRow(): void {
    if (this.qualitativeCriteria.length === 0) {
      this.qualitativeCriteria.push(
        this._formBuilder.group({
          userName: [''],
          userId: [''],
        })
      );
    }
  }

  /** Clear all rows in qualitativeCriteria */
  clearQualitativeCriteria(): void {
    while (this.qualitativeCriteria.length !== 0) {
      this.qualitativeCriteria.removeAt(0);
    }
  }


  get qualitativeTableCriteria(): FormArray {
    return this.fifthFormGroup.get('qualitativeTableCriteria') as FormArray;
  }

  get quantitativeTableCriteria(): FormArray {
    return this.fifthFormGroup.get('quantitativeTableCriteria') as FormArray;
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
  
    const selectedRow = this.dataSourceItems.data.find((row) => row.isSelected);
    if (selectedRow && this.selectedControlAccountRowIndex !== -1) {
      const rowFormGroup = this.qualitativeTableCriteria.at(this.selectedControlAccountRowIndex) as FormGroup;
      rowFormGroup.get('parameter')?.setValue(selectedRow.itemDescription); // Set the value for this row's parameter
      this.selectedInspectionCode = selectedRow.inspectionCode;
      this.selectedItemDescription = selectedRow.itemDescription;
  
      console.log('SELECTED ROW:', selectedRow);
      console.log('UPDATED ROW INDEX:', this.selectedControlAccountRowIndex);
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
  
  displayedColumnsItemsX: string[] = ['inspectionCode', 'itemDescription', 'itemGroup'];
  
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
  
    const selectedRow = this.dataSourceItemsX.data.find((row) => row.isSelected);
    if (selectedRow && this.selectedControlAccountRowIndex !== -1) {
      const rowFormGroup = this.quantitativeTableCriteria.at(this.selectedControlAccountRowIndex) as FormGroup;
      rowFormGroup.get('parameterX')?.setValue(selectedRow.itemDescription);
  
      console.log('Selected row:', selectedRow);
    }
  
    this.selectedControlAccountRowIndex = -1; // Reset index
  }
  
  // onSubmit(): void {
  //   if (this.fourthFormGroup.valid) {
  //     console.log('Form Submitted:', this.fourthFormGroup.value);
  //   } else {
  //     console.log('Form is invalid');
  //   }
  // }
  



  closeDialog(): void {
    this.dialog.closeAll();
}
  
}
