import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
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
import { ListOfQualitativeResultComponent } from '../../list-of-qualitative-result.component';
import { QualitativeResultComponent } from '../qualitative-result.component';
import { QualitativeResultsService } from 'app/core/other-core-services/module/qualitative-results.service';

@Component({
  selector: 'app-add-qualitative-result',
  standalone: true,
  templateUrl: './add-qualitative-result.component.html',
  styleUrl: './add-qualitative-result.component.scss',
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
    MatRadioModule,
  ],
})
export class AddQualitativeResultComponent implements OnInit, AfterViewInit, OnDestroy {
  addQualitativeForm: FormGroup;

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

  errorMessage: string | null = null;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _qualitativeResultComponent: QualitativeResultComponent,
    private _qualitativeResultsService: QualitativeResultsService,
  ) {
    this.addQualitativeForm = new FormGroup({

      resultDescription: new FormControl(''),
    });
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void { }

  onBackdropClicked(): void {
    console.log('On Back Drop Clicked')
    this.matDrawer.close();
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });
  }

  onSubmit(): void {
    console.log('UPDATED FORM VALUES:', this.addQualitativeForm.value);
    const formValues = this.addQualitativeForm.value;
    const payload = {
      ...formValues,
    };
    this._qualitativeResultsService.AddQualitativeResult(payload).subscribe(
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
    this._qualitativeResultComponent.matDrawer.close();
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
  }

}
