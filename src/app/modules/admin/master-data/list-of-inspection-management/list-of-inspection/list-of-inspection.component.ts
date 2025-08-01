import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
import { InspectionCharacteristicsService } from 'app/core/other-core-services/module/inspection-characteristics.service';
import { SessionStorageService } from 'app/core/other-core-services/module/session-storage.service';
import { debounceTime } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-list-of-inspection',
  standalone: true,
  templateUrl: './list-of-inspection.component.html',
  styleUrl: './list-of-inspection.component.scss',
  encapsulation: ViewEncapsulation.None,
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
    RouterOutlet
  ],
})
export class ListOfInspectionComponent implements OnInit, OnDestroy {
  searchInputControl = new FormControl('');

  title = "List of Inspection Characteristics";
  addBtnTitle = "Add";
  addUserBtn = "Add";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';

  displayedColumns: string[] = ['serialId', 'intCode', 'description', 'type', 'attribute', 'isActive', 'action'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _inspectionCharateristics: InspectionCharacteristicsService,
    private _sessionStorageService: SessionStorageService,
    private _location: Location,
  ) { }

  ngOnInit(): void {
    // this._inspectionCharateristics.getInspectionCharacteristics().subscribe((response) => {
    //   this.dataSource = new MatTableDataSource(response.data);
    // });

    // INSPECTION CHARACTERISTICS WITH CRITERIA
    this._inspectionCharateristics.getInspectionWithCriteria().subscribe((response) => {
      this.dataSource = new MatTableDataSource(response.data);
    });

    // CUSTOM FILTER SEARCH
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchText = filter.toLowerCase();
      return data.intCode?.toString().toLowerCase().includes(searchText) ||
        data.description?.toString().toLowerCase().includes(searchText) ||
        data.type?.toString().toLowerCase().includes(searchText) ||
        (data.isActive ? 'active' : 'inactive').includes(searchText);
    };

    // SEARCH WITH COMPLETE PAYLOAD VALUES
    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });

    this._sessionStorageService.clearAll();
  }

  ngOnDestroy(): void {
    // this._sessionStorageService.clearAll();
  }

  ngAfterViewInit() {
    //  this.dataSource.paginator = this.paginator;
  }

  ngAfterViewChecked() {
    if (this.dataSource && this.paginator && this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  applyFilter(searchTerm: string): void {
    searchTerm = searchTerm.trim().toLowerCase();
    this.dataSource.filter = searchTerm;
  }

  onBackdropClicked(): void {
    console.log('On Back Drop Clicked')
    this.matDrawer.close();
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });
  }

  openAddInspectionDrawer(type: 'visitprofile'): void {
    this.matDrawer.open();
    this._router.navigate(['add-list-of-inspection'], { relativeTo: this._activatedRoute });
  }

  openUpdateInspectionDrawer(type: 'visitprofile', element: any): void {
    console.log(element)
    this.matDrawer.open();
    this._router.navigate(['edit-list-of-inspection', element.inspectionCode], { relativeTo: this._activatedRoute, state: { element } });
  }

  openUpdateUoMDrawer(type: 'visitprofile', element: any): void {
    this.matDrawer.open();
    this._router.navigate(['edit-unit-measure-setup', element.uomCode], { relativeTo: this._activatedRoute, state: { element } });
  }

  openStepperToUpdateICH(rowDataICH: any): void {
    console.log('SENDING DATA:', rowDataICH);
    const dataToSendIntoStepperICH = {
      ...rowDataICH, isEditMode: true
    };
    sessionStorage.setItem('stepperDataICH', JSON.stringify(dataToSendIntoStepperICH));
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 3 }
    });
  }

  openStepperToAddICH(): void {
    sessionStorage.removeItem('stepperDataICH');
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 3 }
    });
  }

  onBackArrowClick(): void {
    this._location.back();
  }
}
