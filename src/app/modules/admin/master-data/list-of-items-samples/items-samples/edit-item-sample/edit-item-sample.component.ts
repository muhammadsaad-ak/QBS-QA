import { Component } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { QbsCardComponent } from '@qbs/components/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, UntypedFormBuilder } from '@angular/forms';
import { FormControl, FormGroup } from '@angular/forms';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, CurrencyPipe, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { qbsAnimations } from '@qbs/animations';
import { result } from 'lodash';
import { Validators } from '@angular/forms';

interface itemSamplingIF {
  lotSizeMin: string;
  lotSizeMax: string;
  sampleSize: string;
  criticalDefect: string;
  majorDefect: string;
  minorDefect: string;
}

@Component({
  selector: 'app-edit-item-sample',
  standalone: true,
  templateUrl: './edit-item-sample.component.html',
  styleUrl: './edit-item-sample.component.scss',
  imports: [
    AsyncPipe, CommonModule, CurrencyPipe, DatePipe, FormsModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSortModule, MatSlideToggleModule, MatTableModule, MatTabsModule, MatTooltipModule, NgClass, NgTemplateOutlet, QbsCardComponent, QbsFindByKeyPipe, ReactiveFormsModule, RouterLink, RouterOutlet, TextFieldModule
  ],
  animations: qbsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
})

export class EditItemSampleComponent {
  itemSamplingForm: FormGroup;
  editMode: boolean = false;

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
    private dialog: MatDialog,
  ) {
    this.itemSamplingForm = this.fb.group({
      sampleCode: new FormControl(),
      itemCode: new FormControl(''),
      itemDescription: new FormControl(''),
      flexibility: new FormControl(),
      samples: this.fb.array([]),
    });
  }
  ngOnInit(): void {
    this.addNewRow();
    // HANDLE NAVIGATION STATE DATA 
    const navigationData = history.state.data; // ACCESS THE DATA FROM NAVIGATION STATE
    if (navigationData) {
      console.log('Navigation Data:', navigationData);
      // POPULATE FORM WITH NAVIGATION DATA
      this.populateFormWithItemMasterData(navigationData);
    }
  }
  // POPULATE THE FORM WITH DATA
  populateFormWithItemMasterData(data: any): void {
    if (!data) {
      console.error('NO DATA TO POPULATE THE FORM FIELDS.');
      return;
    }
    // MAPPING RESPONSE 
    this.itemSamplingForm.patchValue({
      // GENERAL SECTION
      sampleCode: data.sampleCode,
      itemCode: data.itemCode,
      itemDescription: data.itemDescription,
      flexibility: data.flexibility,
    });
    // Initialize form array for samples
    const sampleArray = this._formBuilder.array([]);
    // Map through the samples data and add it to the form array
    if (data.samples && Array.isArray(data.samples)) {
      data.samples.forEach(sample => {
        sampleArray.push(this.fb.group({
          lotSizeMin: new FormControl(sample.lotSizeMin),
          lotSizeMax: new FormControl(sample.lotSizeMax),
          sampleSize: new FormControl(sample.sampleSize),
          criticalDefect: new FormControl(sample.criticalDefect),
          majorDefect: new FormControl(sample.majorDefect),
          minorDefect: new FormControl(sample.minorDefect),
        }));
      });
    }
    // Set the samples form array
    this.itemSamplingForm.setControl('samples', sampleArray);
    // Update dataSourceItemSampling
    this.dataSourceItemSampling.data = sampleArray.value;
    console.log('RESPONSE:', this.itemSamplingForm.value);
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

    // Update dataSourceItemSampling with the new value
    this.dataSourceItemSampling.data = this.samples.getRawValue();
  }

  updateItemSamplingForm(): void {
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

  closeDialog(): void {
    this.dialog.closeAll();
  }

  toggleEditMode(editMode: boolean): void {
    if (editMode === null) {
      console.log('editMode toggled');
      this.editMode = !this.editMode;
    } else {
      console.log('editMode set to:', editMode);
      this.editMode = editMode;
    }
  }
}
