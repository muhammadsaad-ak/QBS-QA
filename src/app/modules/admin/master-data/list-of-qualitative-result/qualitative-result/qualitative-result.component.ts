import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet, } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { QualitativeResultsService } from 'app/core/other-core-services/module/qualitative-results.service';
import { SessionStorageService } from 'app/core/other-core-services/module/session-storage.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-qualitative-result',
  standalone: true,
  templateUrl: './qualitative-result.component.html',
  styleUrl: './qualitative-result.component.scss',
  // encapsulation: ViewEncapsulation.None,
  imports: [
    AsyncPipe,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDrawer,
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
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    NgClass,
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterOutlet,
  ],
})
export class QualitativeResultComponent implements OnInit, OnDestroy {
  searchInputControl = new FormControl('');

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

  displayedColumnsQualitativeResults: string[] = [
    'serialNo',
    'intCode',
    'description',
    'status',
    'action'
  ];
  dataSourcsQualitativeResults = new MatTableDataSource<any>([]);
  isLoading = false;
  isDataLoaded = false;
  title = 'Qualitative Results';
  addBtnTitle = 'Add';

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _qualitativeResultsService: QualitativeResultsService,
    private _router: Router,
    private _sessionStorageService: SessionStorageService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.isDataLoaded = true;

    this._qualitativeResultsService.ListAllQualitativeResults().subscribe({
      next: (items: any[]) => {

        // const expandedData = [
        //   ...items,
        //   ...items,
        //   ...items,
        //   ...items,
        // ];
        // this.dataSourcsQualitativeResults = new MatTableDataSource<any>(expandedData);

        this.dataSourcsQualitativeResults = new MatTableDataSource<any>(
          Array.isArray(items) ? items : []
        );

        this.dataSourcsQualitativeResults.paginator = this.paginator;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading qualitative results', err);
        this.dataSourcsQualitativeResults = new MatTableDataSource<any>([]);
        this.dataSourcsQualitativeResults.paginator = this.paginator;
        this.isLoading = false;
      },
    });

    const updatedData = history.state.updatedData;
    if (updatedData) {
      const updatedList = this.dataSourcsQualitativeResults.data.map((item) =>
        item.intCode === updatedData.intCode ? updatedData : item
      );
      this.dataSourcsQualitativeResults = new MatTableDataSource<any>(updatedList);
      this.dataSourcsQualitativeResults.paginator = this.paginator;
    }

    this.searchInputControl.valueChanges.pipe(debounceTime(300)).subscribe((searchTerm: string) => {
      this.applyFilter(searchTerm);
    });

    this._sessionStorageService.clearAll();
  }

  // ngAfterViewInit(): void {
  //   setTimeout(() => {
  //     if (this.dataSourcsQualitativeResults) {
  //       this.dataSourcsQualitativeResults.paginator = this.paginator;
  //     }
  //   });
  // }

  ngAfterViewChecked() {
    if (this.dataSourcsQualitativeResults && this.paginator && this.dataSourcsQualitativeResults.paginator !== this.paginator) {
      this.dataSourcsQualitativeResults.paginator = this.paginator;
    }
  }

  ngOnDestroy(): void { }

  applyFilter(searchTerm: string): void {
    if (!searchTerm) {
      this.dataSourcsQualitativeResults.filter = '';
      return;
    }
    this.dataSourcsQualitativeResults.filter = searchTerm.trim().toLowerCase();
  }

  openStepperToUpdateQR(rowData: any): void {
    const dataToSendIntoStepperQR = {
      ...rowData, isEditMode: true,
    };
    sessionStorage.setItem('stepperDataQR',
      JSON.stringify(dataToSendIntoStepperQR)
    );
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 0 },
    });
  }

  openStepperToAddQR(): void {
    sessionStorage.removeItem('stepperDataQR');
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 0 },
    });
  }
}
