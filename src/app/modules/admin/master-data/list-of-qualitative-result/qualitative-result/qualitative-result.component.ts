import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-qualitative-result',
  standalone: true,
  templateUrl: './qualitative-result.component.html',
  styleUrl: './qualitative-result.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet,
    MatDrawer,
    MatSidenavModule,
    AsyncPipe,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
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
    MatTabsModule,
    NgClass,
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatTableModule
  ],
})
export class QualitativeResultComponent implements OnInit, OnDestroy {
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  addBtnTitle = "Add";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';

  displayedColumns: string[] = ['serialNo', 'itemCode', 'description', 'action'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _qualitativeResultsService: QualitativeResultsService,
  ) { }

  ngOnInit(): void {
    this._qualitativeResultsService.ListAllQualitativeResults().subscribe((items) => {
      this.dataSource.data = items.data;
    })

    // Check if there is updated data from navigation
    const navigationState = history.state.updatedData;
    if (navigationState) {
      const updatedData = navigationState;
      // Now update the with the new data
      this.dataSource.data = this.dataSource.data.map(item =>
        item.itemCode === updatedData.itemCode ? updatedData : item
      );
      // Refresh the table data source
      this.dataSource = new MatTableDataSource<any>(this.dataSource.data);
    }

    //  Search with complete payload values
    // Subscribe to search input field value changes to filter the table data
    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });
  }

  ngOnDestroy(): void { }

  // applyFilter
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
    this._router.navigate(['add-qualitative-result'], { relativeTo: this._activatedRoute });
  }

  openUpdateQRDrawer(type: 'visitprofile', element: any): void {
    this.matDrawer.open();
    console.log(`SENDING DATA: ${JSON.stringify(element)}`);
    this._router.navigate(['edit-qualitative-result', element.itemCode], {
      relativeTo: this._activatedRoute,
      state: { element }
    });
  }
}
