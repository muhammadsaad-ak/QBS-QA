import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormControl  } from '@angular/forms';
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
import { debounceTime } from 'rxjs';
import { ItemSamplesService } from 'app/core/other-core-services/module/item-sample.service';

@Component({
  selector: 'app-list-of-evaluation-plan',
  standalone: true,
  templateUrl: './list-of-evaluation-plan.component.html',
  styleUrl: './list-of-evaluation-plan.component.scss',
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
    MatSidenavModule,
    MatTableModule,
    MatTabsModule,
    NgClass,
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterOutlet
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ListOfEvaluationPlanComponent {

  configForm: UntypedFormGroup;
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  orderTypeControl = new FormControl(null); // Default null, or you can set a default value


  addUserBtn = "Add Qualitative";
  addBtnTitle = "Add";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';

  List_Of_Inspection_Data = [];

  displayedColumns: string[] = ['serialId', 'docNo', 'docDate', 'lineNo', 'itemCode', 'itemDescription', 'qty', 'status', 'action'];
  // dataSource = new MatTableDataSource<any>([]);
  dataSource = new MatTableDataSource<any>(this.List_Of_Inspection_Data);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _itemSamplesService: ItemSamplesService,

    
  ) { }

  ngOnInit(): void {

    this._itemSamplesService.ListAllItemSamples().subscribe((items) => {
      this.dataSource.data = items.data;
    })

    // Check if there is updated data from navigation
    const navigationState = history.state.updatedData;
    if (navigationState) {
      const updatedData = navigationState;
      // Now update the List_Of_Inspection_Data with the new data
      this.List_Of_Inspection_Data = this.List_Of_Inspection_Data.map(item =>
        item.sampleCode === updatedData.sampleCode ? updatedData : item
      );
      // Refresh the table data source
      this.dataSource = new MatTableDataSource<any>(this.List_Of_Inspection_Data);
    }

    this.orderTypeControl.setValue('purchaseOrder'); // Set default to Purchase Order
    this.updateTableColumns('purchaseOrder'); // Initialize table

    this.orderTypeControl.valueChanges.subscribe((selectedType) => {
        this.updateTableColumns(selectedType);
    });

    this._itemSamplesService.ListAllItemSamples().subscribe((items) => {
        this.dataSource.data = items.data;
    });

    this.searchInputControl.valueChanges.pipe(debounceTime(300)).subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
    });
}

updateTableColumns(orderType: string): void {
  if (orderType === 'purchaseOrder') {
      this.displayedColumns = ['serialId', 'docNo', 'docDate', 'lineNo', 'itemCode', 'itemDescription', 'qty', 'status', 'action'];
  } else if (orderType === 'productionOrder') {
      this.displayedColumns = ['serialId', 'docNo', 'docDate', 'lineNo', 'itemCode', 'qty', 'status', 'action']; // Adjusted columns
  }


    // Build the config form
    // this.configForm = this._formBuilder.group({
    //   title: 'Remove User',
    //   message:
    //     'Are you sure you want to remove this user permanently? <span class="font-medium">This action cannot be undone!</span>',
    //   icon: this._formBuilder.group({
    //     show: true,
    //     name: 'heroicons_outline:exclamation-triangle',
    //     color: 'warn',
    //   }),
    //   actions: this._formBuilder.group({
    //     confirm: this._formBuilder.group({
    //       show: true,
    //       label: 'Remove',
    //       color: 'warn',
    //     }),
    //     cancel: this._formBuilder.group({
    //       show: true,
    //       label: 'Cancel',
    //     }),
    //   }),
    //   dismissible: true,
    // });


    //Search with complete payload values
    // Subscribe to search input field value changes to filter the table data
    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });

    //Search with the specific payload values
    // Override the default filterPredicate
    // this.dataSource.filterPredicate = (data: User, filter: string) => {
    //   const transformedFilter = filter.trim().toLowerCase();
    //   // You can add more fields for filtering by expanding the condition below
    //   return (
    //     // data.name.toLowerCase().includes(transformedFilter) ||
    //     data.email.toLowerCase().includes(transformedFilter) ||
    //     data.phone.toLowerCase().includes(transformedFilter) ||
    //     data.department.toLowerCase().includes(transformedFilter)
    //   );
    // };

    // Subscribe to search input field value changes to filter the table data
    // this.searchInputControl.valueChanges.pipe(debounceTime(300)).subscribe((searchTerm: string) => {
    //   this.applyFilter(searchTerm);
    // });


  }
  ngOnDestroy(): void {


  }

  // Method to apply filter on the dataSource
  applyFilter(searchTerm: string): void {
    searchTerm = searchTerm.trim().toLowerCase(); // Remove whitespace and make lowercase
    this.dataSource.filter = searchTerm; // Apply filter (MatTableDataSource handles filtering)
  }


  onBackdropClicked(): void {
    console.log('On Back Drop Clicked')
    this.matDrawer.close();
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });
  }

  // openAddInspectionDrawer(type: 'visitprofile'): void {
  //   this.matDrawer.open();
  //   this._router.navigate(['add-qualitative-result'], { relativeTo: this._activatedRoute });
  // }


  // addbtn(): void {
  //   this._router.navigate(['add-item-sample'], { relativeTo: this._activatedRoute });
  // }

  // actionEditItemData(itemData: any): void {
  //   console.log(itemData);
  //   this._router.navigate(['edit-item-sample'], { state: { data: itemData }, relativeTo: this._activatedRoute });
  // }
}
