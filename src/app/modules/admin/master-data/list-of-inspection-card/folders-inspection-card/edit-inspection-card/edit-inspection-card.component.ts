import { TextFieldModule } from '@angular/cdk/text-field';
import {
    AsyncPipe,
    CommonModule,
    DatePipe,
    Location,
    NgClass,
    NgTemplateOutlet,
} from '@angular/common';
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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    ActivatedRoute,
    Router,
    RouterLink,
    RouterOutlet,
} from '@angular/router';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { ListOfInspectionCardComponent } from '../../list-of-inspection-card.component';

@Component({
    selector: 'app-edit-inspection-card',
    standalone: true,
    templateUrl: './edit-inspection-card.component.html',
    styleUrl: './edit-inspection-card.component.scss',
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
        AsyncPipe,
        DatePipe,
        QbsFindByKeyPipe,
        NgClass,
        NgTemplateOutlet,
        RouterLink,
        RouterOutlet,
        TextFieldModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSlideToggleModule,
    ],
})
export class EditInspectionCardComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    editInspectionCardForm: FormGroup;
    // qualitativeParameters: string[] = [];

    editMode: boolean = false;
    errorMessage: string | null = null;
    element: any;

    private _changeDetectorRef: any;
    selectedTab = 0; // To track active tab

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        // private _ListOfInspectionCardComponent: ListOfInspectionCardComponent,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private _location: Location,
        private _unitMeasureSetupComponent: ListOfInspectionCardComponent
    ) {
        // Initialize form
        this.editInspectionCardForm = this.fb.group({
            cardCode: new FormControl(''),
            cardDescription: new FormControl(''),
            isActive: new FormControl(),
            // parameter: new FormControl(''),
            // qualitativeCriteria: this._formBuilder.array([]),
            // quantitativeCriteria: this._formBuilder.array([]),
            qualitativeCriteria: this.fb.array([]),
            quantitativeCriteria: this.fb.array([]),
        });
    }

    ngOnInit(): void {
        // Initialize form with one row
        this.addRow();
        this.addRowX();

        const navigation = this._location.getState() as { element: any };
        if (navigation?.element) {
            this.element = navigation.element;
            // console.log(this.element);
            this.populateFormWithInspectionCardData(this.element);
        } else {
            console.error('No element data found in route state');
        }
    }

    populateFormWithInspectionCardData(data: any): void {
        if (!data) {
            console.error('NO DATA TO POPULATE THE FORM FIELDS.');
        }
        console.log(data);
        this.editInspectionCardForm.patchValue({
            cardCode: data.cardCode || '',
            cardDescription: data.description || '',
            isActive: data.status,
        });

        // Initialize form array for samples
        const sampleArray = this._formBuilder.array([]);
        // Map through the samples data and add it to the form array
        if (data.qualitativeCriteria && Array.isArray(data.qualitativeCriteria)) {
            data.qualitativeCriteria.forEach((sample) => {
                sampleArray.push(
                    this.fb.group({
                      parameter: new FormControl(sample.parameter),
                    })
                );
            });
        }
        // Set the samples form array
        this.editInspectionCardForm.setControl('samples', sampleArray);
        // Update dataSourceItemSampling
        this.dataSourceItems.data = sampleArray.value;
    }

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

    //   populateFormWithListOfInspectionCard(data: any): void {
    //     if (!data) {
    //         console.error('NO DATA TO POPULATE THE FORM FIELDS.');
    //         return;
    //     }
    //     console.log(data);
    //     this.editInspectionCardForm.patchValue({
    //       cardCode: data.uomCode || '',
    //       cardDescription: data.uomName || '',
    //       selected:data
    //     });
    // }

    ngAfterViewInit(): void {}

    ngOnDestroy(): void {}

    /** Getter for qualitativeCriteria FormArray */
    get qualitativeCriteria(): FormArray {
        return this.editInspectionCardForm.get(
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

    this.dataSourceItems.data = [...this.qualitativeCriteria.value]; // Update the table data source

    // Update dataSourceItemSampling with the new value
    this.dataSourceItems.data = this.qualitativeCriteria.getRawValue();
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

        const selectedRow = this.dataSourceItems.data.find(
            (row) => row.isSelected
        );
        if (selectedRow && this.selectedControlAccountRowIndex !== -1) {
            const rowFormGroup = this.qualitativeCriteria.at(
                this.selectedControlAccountRowIndex
            ) as FormGroup;
            rowFormGroup
                .get('parameter')
                ?.setValue(selectedRow.itemDescription); // Set the value for this row's parameter
            this.selectedItemCode = selectedRow.itemCode;
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

    //////////////////////////////////////////////

    get quantitativeCriteria(): FormArray {
        return this.editInspectionCardForm.get(
            'quantitativeCriteria'
        ) as FormArray;
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
    displayedColumnsItemsX: string[] = [
        'itemCodeX',
        'itemDescriptionX',
        'itemGroupX',
    ];
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

        const selectedRow = this.dataSourceItemsX.data.find(
            (row) => row.isSelectedX
        );
        if (selectedRow && this.selectedControlAccountRowIndexX !== -1) {
            const rowFormGroup = this.quantitativeCriteria.at(
                this.selectedControlAccountRowIndexX
            ) as FormGroup;
            rowFormGroup
                .get('parameterX')
                ?.setValue(selectedRow.itemDescriptionX);
            this.selectedItemCodeX = selectedRow.itemCodeX;
            this.selectedItemDescriptionX = selectedRow.itemDescriptionX;

            console.log('SELECTED ROW:', selectedRow);
            console.log(
                'UPDATED ROW INDEX:',
                this.selectedControlAccountRowIndexX
            );
        } else {
            console.log('NO ROW SELECTED');
        }

        this.selectedControlAccountRowIndexX = -1;
    }

    closeDialog(): void {
        this.dialog.closeAll();
    }

    onUpdate(): void {
        console.log('Form Values Updated:', this.editInspectionCardForm.value);
    }
}
//

// if (this.addInspectionCardForm.valid) {
//   console.log('Form submitted:', this.addInspectionCardForm.value);
//   =
//   this._router.navigate(['../'], { relativeTo: this._activatedRoute });
// }
