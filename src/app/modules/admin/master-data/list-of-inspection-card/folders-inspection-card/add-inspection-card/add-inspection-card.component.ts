import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { ListOfInspectionCardComponent } from '../../list-of-inspection-card.component';

@Component({
    selector: 'app-add-inspection-card',
    standalone: true,
    templateUrl: './add-inspection-card.component.html',
    styleUrl: './add-inspection-card.component.scss',
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatTableModule,
        MatTabsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatOptionModule,
        MatSelectModule,
        MatSidenavModule,
        MatTooltipModule,
        MatRadioModule,
    ],
})
export class AddInspectionCardComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    addInspectionCardForm: FormGroup;
    // qualitativeParameters: string[] = [];

    editMode: boolean = false;
    errorMessage: string | null = null;
    private _changeDetectorRef: any;

    selectedTab = 0; // To track active tab
    quantitative;
    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private dialog: MatDialog,
        private _ListOfInspectionCardComponent: ListOfInspectionCardComponent,
        private fb: FormBuilder
    ) {
        // Initialize form
        this.addInspectionCardForm = this.fb.group({
            cardCode: new FormControl(''),
            cardDescription: new FormControl(''),
            isActive: new FormControl(false),
            // parameter: new FormControl(''),
            qualitativeCriteria: this._formBuilder.array([]),
            quantitativeCriteria: this._formBuilder.array([]),
        });
    }

    ngOnInit(): void {
        // Initialize form with one row
        this.addRow();
        this.addRowX();
        
        // this.loadQualitativeParameters();
    }

    // loadQualitativeParameters(): void {
    //   this.qualitativeParameters = ['Color Shade', 'Dent/Damage', 'Bubbles'];
    // }

    ngAfterViewInit(): void {}

    ngOnDestroy(): void {}

    /** Getter for qualitativeCriteria FormArray */
    get qualitativeCriteria(): FormArray {
        return this.addInspectionCardForm.get(
            'qualitativeCriteria'
        ) as FormArray;
    }

    /** Create a new FormGroup for a row with a checkbox */
    createRow(parameter: string = ''): FormGroup {
        return this._formBuilder.group({
            selected: [false], // Checkbox for selection
            parameter: [parameter],
        });
    }

    /** Add a new row to the table */
    addRow(): void {
        this.qualitativeCriteria.push(this.createRow());
    }

    /** Remove a row at a specific index */
    removeRow(index: number): void {
        if (this.qualitativeCriteria.length > 0) {
            this.qualitativeCriteria.removeAt(index);
        }
    }

    /** Remove all selected rows */
    removeSelectedRows(): void {
        for (let i = this.qualitativeCriteria.length - 1; i >= 0; i--) {
            if (this.qualitativeCriteria.at(i).get('selected')?.value) {
                this.qualitativeCriteria.removeAt(i);
            }
        }
    }

    /** Select or deselect all checkboxes */
    // selectAll(checked: boolean): void {
    //     this.qualitativeCriteria.controls.forEach((control) => {
    //         control.get('selected')?.setValue(checked);
    //     });
    // }

    // /** Create a new FormGroup row */
    // createRow(): FormGroup {
    //   return this._formBuilder.group({
    //     userId: [''],
    //     userName: [''],
    //   });
    // }

    // /** Add a new row to the form */
    // addRow(): void {
    //   this.qualitativeCriteria.push(this.createRow());
    // }

    // /** Remove a row by index */
    // removeRow(index: number): void {
    //   if (this.qualitativeCriteria.length > 1) {
    //     this.qualitativeCriteria.removeAt(index);
    //   }
    // }

    /** Toggle between edit and view modes */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        if (this._changeDetectorRef) {
            this._changeDetectorRef.detectChanges();
        }
    }
    onSubmit(): void {
        if (this.addInspectionCardForm.valid) {
            console.log('Full form value:', this.addInspectionCardForm.value);

            // Navigate to the list of inspection cards after a successful submission
            this._ListOfInspectionCardComponent.matDrawer.close();
        }
    }

    @ViewChild('dialogTemplateItems') dialogTemplateItems;
    dataSourceItems = new MatTableDataSource([
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
            itemGroup: '',
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
            width: '39%',
            height: '75vh',
            data: this.dataSourceItems,
        });
        dialogRef.afterClosed().subscribe((result) => {
            console.log('DIALOG CLOSED');
        });
    }
    displayedColumnsItems: string[] = [
        'itemCode',
        'itemDescription',
        'itemGroup',
    ];
    selectedItemCode: string = '';
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
        const rowFormGroup = this.qualitativeCriteria.at(this.selectedControlAccountRowIndex) as FormGroup;
        rowFormGroup.get('parameter')?.setValue(selectedRow.itemDescription); // Set the value for this row's parameter
        this.selectedItemCode = selectedRow.itemCode;
        this.selectedItemDescription = selectedRow.itemDescription;
    
        console.log('SELECTED ROW:', selectedRow);
        console.log('UPDATED ROW INDEX:', this.selectedControlAccountRowIndex);
      } else {
        console.log('NO ROW SELECTED');
      }
    
      // Reset the index after selection
      this.selectedControlAccountRowIndex = -1;
    }

    //////////////////////////////////////////////

    get quantitativeCriteria(): FormArray {
      return this.addInspectionCardForm.get('quantitativeCriteria') as FormArray;
  }
  
  /** Create a new FormGroup for a quantitative row */
  createRowX(parameterX: string = ''): FormGroup {
      return this._formBuilder.group({
          selectedX: [false],
          parameterX: [parameterX],
      });
  }
  
  /** Add a new row to the quantitative table */
  addRowX(): void {
      this.quantitativeCriteria.push(this.createRowX());
  }
  
  /** Remove a row at a specific index */
  removeRowX(index: number): void {
      if (this.quantitativeCriteria.length > 0) {
          this.quantitativeCriteria.removeAt(index);
      }
  }
  
  /** Remove all selected rows */
  removeSelectedRowsX(): void {
      for (let i = this.quantitativeCriteria.length - 1; i >= 0; i--) {
          if (this.quantitativeCriteria.at(i).get('selectedX')?.value) {
              this.quantitativeCriteria.removeAt(i);
          }
      }
  }

  // Add these properties to your component class
@ViewChild('dialogTemplateItemsX') dialogTemplateItemsX;
dataSourceItemsX = new MatTableDataSource([
    {
        itemIdX: 1,
        itemCodeX: 'QBS0012561',
        itemDescriptionX: 'QBS Bucket 3KG',
        itemGroupX: 'Item Group A',
        isSelectedX: false,
    },
    {
        itemIdX: 2,
        itemCodeX: 'QBS0012562',
        itemDescriptionX: 'QBS Bucket 5KG',
        itemGroupX: '',
        isSelectedX: false,
    },
]);

selectedControlAccountRowIndexX: number = -1;
displayedColumnsItemsX: string[] = ['itemCodeX', 'itemDescriptionX', 'itemGroupX'];
selectedItemCodeX: string = '';
selectedItemDescriptionX: string = '';

onItemCodeClickX(rowIndex: number): void {
    this.selectedControlAccountRowIndexX = rowIndex;
    const dialogRef = this.dialog.open(this.dialogTemplateItemsX, {
        width: '39%',
        height: '75vh',
        data: this.dataSourceItemsX,
    });
    dialogRef.afterClosed().subscribe(() => {
        console.log('DIALOG CLOSED');
    });
}

onRowCheckboxChangeItemsX(selectedRow: any): void {
    this.dataSourceItemsX.data.forEach((row) => (row.isSelectedX = false));
    selectedRow.isSelectedX = true;
}

applyFilterItemsX(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceItemsX.filter = filterValue.trim().toLowerCase();
}

addSelectedRowItemX(): void {
    this.dialog.closeAll();

    const selectedRow = this.dataSourceItemsX.data.find((row) => row.isSelectedX);
    if (selectedRow && this.selectedControlAccountRowIndexX !== -1) {
        const rowFormGroup = this.quantitativeCriteria.at(this.selectedControlAccountRowIndexX) as FormGroup;
        rowFormGroup.get('parameterX')?.setValue(selectedRow.itemDescriptionX);
        this.selectedItemCodeX = selectedRow.itemCodeX;
        this.selectedItemDescriptionX = selectedRow.itemDescriptionX;

        console.log('SELECTED ROW:', selectedRow);
        console.log('UPDATED ROW INDEX:', this.selectedControlAccountRowIndexX);
    } else {
        console.log('NO ROW SELECTED');
    }

    this.selectedControlAccountRowIndexX = -1;
}
  
    

    closeDialog(): void {
        this.dialog.closeAll();
    }
}
//

// if (this.addInspectionCardForm.valid) {
//   console.log('Form submitted:', this.addInspectionCardForm.value);
//   =
//   this._router.navigate(['../'], { relativeTo: this._activatedRoute });
// }
