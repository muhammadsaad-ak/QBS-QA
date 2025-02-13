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
import { ItemSamplesService } from 'app/core/other-core-services/module/item-sample.service';

interface itemSamplingRangeIF {
    lotSizeMin: number;
    lotSizeMax: number;
    sampleQty: number;
    criticalDefects: number;
    majorDefects: number;
    minorDefects: number;
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
    dataSourceItemCodeIS!: MatTableDataSource<any>;

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

    constructor(
        private fb: FormBuilder,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private dialog: MatDialog,
        private _itemSamplesService: ItemSamplesService,
    ) {
        this.itemSamplingForm = this.fb.group({
            sampleCodeIS: new FormControl(),
            itemId: new FormControl(''),
            itemDescription: new FormControl(''),
            flexibility: new FormControl(false),
            samplingRangeObjects: this.fb.array([]),
            itemCode: new FormControl(''),
        });
    }

    ngOnInit(): void {
        this._itemSamplesService.getSampleCodeIS().subscribe((sampleCodeIS) => {
            const fetchedCodeIS = sampleCodeIS.data;
            console.log('FETCHED CODE:', fetchedCodeIS);
            if (fetchedCodeIS) {
                const formattedSampleCodeIS = `IS-000${fetchedCodeIS}`
                this.itemSamplingForm.get('sampleCodeIS')?.setValue(formattedSampleCodeIS);
            }
        });
        this.addNewRow();
        this.fetchListAllItems();
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

    get samplingRangeObjects(): FormArray {
        return this.itemSamplingForm.get('samplingRangeObjects') as FormArray;
    }

    addNewRow(): void {
        const itemSamplingFormGroup = this.fb.group({
            lotSizeMin: [],
            lotSizeMax: [],
            sampleQty: [],
            criticalDefects: [],
            majorDefects: [],
            minorDefects: [],
        });
        this.samplingRangeObjects.push(itemSamplingFormGroup); // Add a new FormGroup to FormArray
        this.dataSourceItemSampling.data = [...this.samplingRangeObjects.value]; // Update the table data source
    }

    submitForm(): void {
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

}
