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
import { SessionStorageService } from 'app/core/other-core-services/module/session-storage.service';
import { UomMasterService } from 'app/core/other-core-services/module/uom-master.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-unit-measure-setup',
  standalone: true,
  templateUrl: './unit-measure-setup.component.html',
  styleUrl: './unit-measure-setup.component.scss',
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
export class UnitMeasureSetupComponent implements OnInit, OnDestroy {
  unitOfMeasureLOV: any = [];
  searchInputControl = new FormControl('');

  title = "Unit of Measure";
  addBtnTitle = "Add";
  addUserBtn = "Add";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';

  displayedColumns: string[] = ['serialId', 'uoMCode', 'description', 'status', 'action'];
  dataSourceUoM = new MatTableDataSource<any>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
  }

  ngAfterViewChecked() {
    if (this.dataSourceUoM && this.paginator && this.dataSourceUoM.paginator !== this.paginator) {
      this.dataSourceUoM.paginator = this.paginator;
    }
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _uommasterservice: UomMasterService,
    private _sessionStorageService: SessionStorageService,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this._uommasterservice.getUnitOfMeasure().subscribe((response) => {
      // this.dataSource = unitOfMeasure.data // SAAD
      this.dataSourceUoM = new MatTableDataSource(response.data);
      this.dataSourceUoM.paginator = this.paginator;
      this.isLoading = false;
    });

    this.dataSourceUoM.filterPredicate = (data: any, filter: string) => {
      const searchText = filter.toLowerCase();
      return data.intCode?.toString().toLowerCase().includes(searchText) ||
        data.description?.toString().toLowerCase().includes(searchText) ||
        data.type?.toString().toLowerCase().includes(searchText) ||
        (data.isActive ? 'active' : 'inactive').includes(searchText);
    };

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
    this.dataSourceUoM.filter = searchTerm;
  }

  onBackdropClicked(): void {
    console.log('On Back Drop Clicked')
    this.matDrawer.close();
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });
  }

  openStepperToAddUOM(): void {
    sessionStorage.removeItem('stepperDataUOM');
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 1 }
    });
  }

  openUpdateUoMDrawer(type: 'visitprofile', element: any): void {
    this.matDrawer.open();
    this._router.navigate(['edit-unit-measure-setup', element.uomCode],
      { relativeTo: this._activatedRoute, state: { element } });
  }

  openStepperToUpdateUOM(rowDataUOM: any): void {
    // console.log('Row Data UOM:', rowDataUOM);
    const dataToSendIntoStepperUOM = {
      ...rowDataUOM, isEditMode: true
    };
    sessionStorage.setItem('stepperDataUOM', JSON.stringify(dataToSendIntoStepperUOM));
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 1 }
    });
  }
}
