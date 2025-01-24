import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
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

@Component({
  selector: 'app-edit-qualitative-result',
  standalone: true,
  templateUrl: './edit-qualitative-result.component.html',
  styleUrl: './edit-qualitative-result.component.scss',
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
export class EditQualitativeResultComponent implements OnInit, AfterViewInit, OnDestroy {

  
      @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  
  
      editQualitativeResultForm: FormGroup;
      errorMessage: string | null = null; 
      editMode: boolean = false;
  
  
      constructor(
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _quanlitativeResultComponent: QualitativeResultComponent,
      ) { 
        // Add List of Inspection Form Group
        this.editQualitativeResultForm = this._formBuilder.group({
          inspectionCode: [''],
          description: [''],
          inspectionType: [''],
          status: [''],
          qualitativeCriteria: this._formBuilder.array([
            this.createRow()
          ]),
        })
      }
  
      createRow(): FormGroup {
        return this.createUserRow();
      }
    
      get qualitativeCriteria(): FormArray {
        return this.editQualitativeResultForm.get('qualitativeCriteria') as FormArray;
      }
  
      removeRow(index: number): void {
        if (this.qualitativeCriteria.length > 1) {
          this.qualitativeCriteria.removeAt(index);
        }
        this.errorMessage = null; 
      }
  
      createUserRow(): FormGroup {
        const row =  this._formBuilder.group({
          id: [0],
          name: [''],
        });
    
        row.get('userName')?.valueChanges.subscribe(value => {
          if (!value) {
            const rowIndex = this.qualitativeCriteria.controls.indexOf(row) !== -1 
              ? this.qualitativeCriteria.controls.indexOf(row) 
              : this.qualitativeCriteria.controls.indexOf(row);
    
            if (rowIndex > -1) {
              this.qualitativeCriteria.controls.indexOf(row) > -1
                ? this.removeRow(rowIndex)
                : this.removeRow(rowIndex);
            }
          }
        });
    
        return row;
        
      }
  
      
      ngOnInit(): void {
        
      }
  
      ngAfterViewInit(): void {
        
      }
  
      ngOnDestroy(): void {
        
      }
    
      onSubmit(): void {
        this._quanlitativeResultComponent.matDrawer.close();
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
      }
      
      /**
    * Toggle edit mode
    *
    * @param editMode
    */
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
