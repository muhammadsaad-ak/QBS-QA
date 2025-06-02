import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
import { InspectionAttributesService } from 'app/core/other-core-services/module/inspection-attributes.service';
import { Location } from '@angular/common'; 

@Component({
  selector: 'app-inspection-attributes',
  standalone: true,
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
  templateUrl: './inspection-attributes.component.html',
  styleUrl: './inspection-attributes.component.scss'
})

export class InspectionAttributesComponent {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  title = "Inspection Attributes";
  subtitle = "List of Inspection Attributes";
  addBtnTitle = "Add";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';

  displayedColumnsInspectionAttributes: string[] = ['serialNo', 'intCode', 'name', 'status', 'action'];
  dataSourcensInspectionAttributes = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSourcensInspectionAttributes.paginator = this.paginator;
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _inspectionAttributesService: InspectionAttributesService,
    private _location: Location,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private _sessionStorageService: SessionStorageService,
    private _formBuilder: UntypedFormBuilder,
  ) { }

  ngOnInit(): void {
    this._inspectionAttributesService.ListAllInspectionAttributes().subscribe((items) => {
      this.dataSourcensInspectionAttributes.data = items.data;
    })

    // Check if there is updated data from navigation
    const navigationState = history.state.updatedData;
    if (navigationState) {
      const updatedData = navigationState;
      // Now update the with the new data
      this.dataSourcensInspectionAttributes.data = this.dataSourcensInspectionAttributes.data.map(item =>
        item.intCode === updatedData.intCode ? updatedData : item
      );
      // Refresh the table data source
      this.dataSourcensInspectionAttributes = new MatTableDataSource<any>(this.dataSourcensInspectionAttributes.data);
    }

    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });

    this._sessionStorageService.clearAll();
  }

  ngOnDestroy(): void { }

  applyFilter(searchTerm: string): void {
    searchTerm = searchTerm.trim().toLowerCase();
    this.dataSourcensInspectionAttributes.filter = searchTerm;
  }

onBackArrowClick(): void {
  this._location.back(); 
}

  openAddQualitativeResultDrawer(type: 'visitprofile'): void {
    this.matDrawer.open();
    this._router.navigate(['add-qualitative-result'], {
      relativeTo: this._activatedRoute,
    });
  }

  // openQRUpdateDrawer(type: 'visitprofile', element: any): void {
  //   this.matDrawer.open();
  //   // console.log(`SENDING DATA: ${JSON.stringify(element)}`);
  //   this._router.navigate(['edit-qualitative-result', element.intCode], {
  //     relativeTo: this._activatedRoute,
  //     state: { element }
  //   });
  // }

  openStepperToUpdateIA(rowData: any): void {
    console.log('SENDING DATA:', rowData);
    const dataToSendIntoStepperIA = {
      ...rowData, isEditMode: true
    };
    sessionStorage.setItem('stepperDataIA', JSON.stringify(dataToSendIntoStepperIA));
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 2 }
    });
  }

  openStepperToAddIA(): void {
    sessionStorage.removeItem('stepperDataIA');
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 2 }
    });
  }
}
