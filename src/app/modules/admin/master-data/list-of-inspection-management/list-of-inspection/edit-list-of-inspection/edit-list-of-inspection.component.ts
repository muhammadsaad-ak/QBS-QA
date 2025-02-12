import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgTemplateOutlet, Location } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { ListOfInspectionComponent } from '../list-of-inspection.component';
// import { inspect } from 'util';


@Component({
  selector: 'app-edit-list-of-inspection',
  standalone: true,
  templateUrl: './edit-list-of-inspection.component.html',
  styleUrl: './edit-list-of-inspection.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatTooltipModule,
    AsyncPipe,
    CommonModule,
    DatePipe,
    QbsFindByKeyPipe,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
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
    MatTabsModule,
    NgClass,
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
    TextFieldModule,
    MatAutocompleteModule,
    MatRadioModule
  ],
})
export class EditListOfInspectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

  editInspectionForm: FormGroup;
  editMode: boolean = false;
  errorMessage: string | null = null;
  private _changeDetectorRef: any;
  element: any;

  

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _inspectionListComponent: ListOfInspectionComponent,
    private _location: Location
  ) {
    this.editInspectionForm = this._formBuilder.group({
      LICcode: [''],
      LICdescription: [''],
      isSuperUser: [''],
      inspectionType: [''],
      status: [false],
      qualitativeCriteria: this._formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    // Initialize form with one row
    this.addRow();

      const navigation = this._location.getState() as { element: any };
        if (navigation?.element) {
            this.element = navigation.element;
            // console.log(this.element);

            this.populateFormWithData(this.element);
        } else {
            console.error('No element data found in route state');
        }
    
  }

  populateFormWithData(data: any): void {
    if (!data) {
        console.error('NO DATA TO POPULATE THE FORM FIELDS.');
        return;
    }
    console.log(data);
    this.editInspectionForm.patchValue({
      LICcode: data.inspectionCode || '',
      LICdescription: data.description || '',
      inspectionType: data.inspectionType || '',
      
  });
   
}
  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  /** Getter for qualitativeCriteria FormArray */
  get qualitativeCriteria(): FormArray {
    return this.editInspectionForm.get('qualitativeCriteria') as FormArray;
  }

  /** Create a new FormGroup row */
  createRow(): FormGroup {
    return this._formBuilder.group({
      userId: [''],
      userName: [''],
    });
  }

  /** Add a new row to the form */
  addRow(): void {
    this.qualitativeCriteria.push(this.createRow());
  }

  /** Remove a row by index */
  removeRow(index: number): void {
    if (this.qualitativeCriteria.length > 1) {
      this.qualitativeCriteria.removeAt(index);
    }
  }

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

  /** Form submission logic */
  onSubmit(): void {
    if (this.editInspectionForm.valid) {
      console.log('Form Submitted', this.editInspectionForm.value);
      this._inspectionListComponent.matDrawer.close();
      this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    } else {
      this.errorMessage = 'Please fill all required fields correctly';
    }
  }
}