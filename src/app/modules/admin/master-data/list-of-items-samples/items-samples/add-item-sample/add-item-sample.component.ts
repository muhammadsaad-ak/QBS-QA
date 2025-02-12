import { SelectionModel } from '@angular/cdk/collections';
import { TextFieldModule } from '@angular/cdk/text-field';
import {
    AsyncPipe,
    CommonModule,
    CurrencyPipe,
    DatePipe,
    NgClass,
    NgTemplateOutlet,
} from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
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
import { qbsAnimations } from '@qbs/animations';
import { QbsCardComponent } from '@qbs/components/card';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';

interface itemSamplingIF {
    lotSizeMin: string;
    lotSizeMax: string;
    sampleSize: string;
    criticalDefect: string;
    majorDefect: string;
    minorDefect: string;
}

@Component({
    selector: 'app-add-item-sample',
    standalone: true,
    templateUrl: './add-item-sample.component.html',
    styleUrl: './add-item-sample.component.scss',
    imports: [
        AsyncPipe,
        CommonModule,
        CurrencyPipe,
        DatePipe,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatOptionModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSortModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        NgClass,
        NgTemplateOutlet,
        QbsCardComponent,
        QbsFindByKeyPipe,
        ReactiveFormsModule,
        RouterLink,
        RouterOutlet,
        TextFieldModule,
    ],
    animations: qbsAnimations,
    encapsulation: ViewEncapsulation.None,
    providers: [DatePipe],
})
export class AddItemSampleComponent {
    itemSamplingForm: FormGroup;

    displayedColumnsItemSampling = [
        'lotSizeMin',
        'lotSizeMax',
        'sampleSize',
        'criticalDefect',
        'majorDefect',
        'minorDefect',
    ];
    dataSourceItemSampling = new MatTableDataSource<itemSamplingIF>();
    selectionItemSampling = new SelectionModel<itemSamplingIF>(true, []);

    constructor(
        private fb: FormBuilder,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private dialog: MatDialog
    ) {
        this.itemSamplingForm = this.fb.group({
            sampleCode: new FormControl(),
            itemCode: new FormControl(''),
            itemDescription: new FormControl(''),
            flexibility: new FormControl(false),
            samples: this.fb.array([]),
        });
    }

    ngOnInit(): void {
        this.addNewRow();
    }

    get samples(): FormArray {
        return this.itemSamplingForm.get('samples') as FormArray;
    }

    addNewRow(): void {
        const itemSamplingFormGroup = this.fb.group({
            lotSizeMin: [''],
            lotSizeMax: [''],
            sampleSize: [''],
            criticalDefect: [''],
            majorDefect: [''],
            minorDefect: [''],
        });

        this.samples.push(itemSamplingFormGroup); // Add a new FormGroup to FormArray
        this.dataSourceItemSampling.data = [...this.samples.value]; // Update the table data source
    }

    submitForm(): void {
        if (this.itemSamplingForm.valid) {
            const formValues = this.itemSamplingForm.value;
            const payload = {
                ...formValues,
            };
            console.log('FORM SUBMISSION PAYLOAD:', payload);
            // this.itemSamplingForm.reset();
        } else {
            console.log('FORM IS INVALID!');
        }
    }

    // ITEM SAMPLE ITEM CODE NG TEMPLATE STARTS
    @ViewChild('dialogTemplateItemSampleItems') dialogTemplateItemSampleItems;
    // dataSourceItemSampleCode = [];
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
            itemCode: 'ITM0012562',
            itemDescription: 'Paint Bucket 5KG',
            itemGroup: '',
            isSelected: false,
        },
    ]);
    //
    onItemSampleItemCodeClick() {
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
    applyFilterItemSampleCode(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceItemSampleCode.filter = filterValue.trim().toLowerCase();
    }
    // ITEM SAMPLE ITEM CODE NG TEMPLATE ENDS
    closeDialog(): void {
        this.dialog.closeAll();
    }
}
