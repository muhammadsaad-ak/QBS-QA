import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-add-list-of-inspection',
  standalone: true,
  templateUrl: './add-list-of-inspection.component.html',
  styleUrl: './add-list-of-inspection.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
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
    MatRadioModule
  ],
})
export class AddListOfInspectionComponent implements OnInit, AfterViewInit, OnDestroy  {

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

  addInspectionForm: FormGroup;
  editMode: boolean = false;
  errorMessage: string | null = null;
  private _changeDetectorRef: any;

  // users = [
  //   { userName: 'John Doe', id: 1 },
  //   { userName: 'Jane Smith', id: 2 },
  // ];

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) { 
    // Initialize form
    this.addInspectionForm = this._formBuilder.group({
      inspectionCode: [''],
      description: [''],
      inspectionType: [''],
      status: [''],
      qualitativeCriteria: this._formBuilder.array([]),
    });
  }
  ngOnInit(): void {
    // Initialize form with one row
    this.addRow();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  /** Getter for qualitativeCriteria FormArray */
  get qualitativeCriteria(): FormArray {
    return this.addInspectionForm.get('qualitativeCriteria') as FormArray;
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
  onSubmit(): void {
    this.matDrawer.close();  
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
  }
}
