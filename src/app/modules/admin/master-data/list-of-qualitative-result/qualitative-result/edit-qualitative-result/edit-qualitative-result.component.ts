import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
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
import { QualitativeResultComponent } from '../qualitative-result.component';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-edit-qualitative-result',
  standalone: true,
  templateUrl: './edit-qualitative-result.component.html',
  styleUrl: './edit-qualitative-result.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [AsyncPipe, CommonModule, DatePipe, FormsModule, MatAutocompleteModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatDatepickerModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSortModule, MatSlideToggleModule, MatTabsModule, MatRadioModule, MatTooltipModule, NgClass, NgTemplateOutlet, ReactiveFormsModule, RouterLink, RouterOutlet, TextFieldModule, QbsFindByKeyPipe],
})
export class EditQualitativeResultComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  itemMasterForm: FormGroup;
  editQualitativeResultsForm: FormGroup;
  errorMessage: string | null = null;
  editMode: boolean = false;
  elementData: any;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _quanlitativeResultComponent: QualitativeResultComponent,
    private _location: Location,
    private _changeDetectorRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    this.editQualitativeResultsForm = new FormGroup({
      qrCode: new FormControl(),
      qrDescription: new FormControl(''),
    });
  }
  ngOnInit(): void {
    const navigation = this._location.getState() as { element: any };
    if (navigation?.element) {
      this.elementData = navigation.element;
      // console.log(this.elementData);
      this.populateQRFormWithStateData(this.elementData);
    } else {
      console.error('NO ELEMENT DATA FOUND IN ROUTE STATE');
    }
  }
  populateQRFormWithStateData(data: any): void {
    if (!data) {
      console.error('NO DATA TO POPULATE THE FORM FIELDS.');
      return;
    }
    // MAPPING RESPONSE 
    // console.log(data);
    this.editQualitativeResultsForm.patchValue({
      qrCode: data.qualitativeCode || '',
      qrDescription: data.description || '',
    });
    // console.log('RESPONSE:', this.editQualitativeResultsForm.value);
  }

  ngAfterViewInit(): void {
  }
  ngOnDestroy(): void {
  }

  onSubmit(): void {
    console.log('UPDATED FORM VALUES:', this.editQualitativeResultsForm.value);
    this._quanlitativeResultComponent.matDrawer.close();
    this._router.navigate(['../../'], { relativeTo: this._activatedRoute });
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