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
import { InspectionCharacteristicsService } from 'app/core/other-core-services/module/inspection-characteristics.service';
import { SessionStorageService } from 'app/core/other-core-services/module/session-storage.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-list-of-inspection',
  standalone: true,
  templateUrl: './list-of-inspection.component.html',
  styleUrl: './list-of-inspection.component.scss',
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
export class ListOfInspectionComponent implements OnInit, OnDestroy {

  configForm: UntypedFormGroup;
  searchInputControl: UntypedFormControl = new UntypedFormControl();

  addUserBtn = "Add";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';


  // List_Of_Inspection_Data= [
  //   { inspectionCode: 'T001X', description: 'Weight', inspectionType: 'Qualitative', status: 'Active' },
  //   { inspectionCode: 'T002', description: 'Transparency Level', inspectionType: 'Quantitative', status: 'Inactive' },
  // ];
  
  displayedColumns: string[] = ['serialId', 'intCode' , 'description', 'type', 'isActive', 'action'];
  // dataSource = new MatTableDataSource<any>(this.List_Of_Inspection_Data);
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
    private _inspectionCharateristics: InspectionCharacteristicsService,
    private _sessionStorageService: SessionStorageService,
    
    
  ) { } 

  ngOnInit(): void {

    // this._inspectionCharateristics.getInspectionCharacteristics().subscribe((response) => {
    //   this.dataSource = new MatTableDataSource(response.data);
    //   this.dataSource.paginator = this.paginator;
    // });
    // INSPECTION CHARACTERISTICS WITH CRITERIA
    this._inspectionCharateristics.getInspectionWithCriteria().subscribe((response) => {
      this.dataSource = new MatTableDataSource(response.data);
      this.dataSource.paginator = this.paginator;
    });

    // Custom filter for better search
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchText = filter.toLowerCase();
      return data.intCode?.toString().toLowerCase().includes(searchText) ||
        data.description?.toString().toLowerCase().includes(searchText) ||
        data.type?.toString().toLowerCase().includes(searchText) ||
        (data.isActive ? 'active' : 'inactive').includes(searchText);
    };

    // Build the config form
    this.configForm = this._formBuilder.group({
      title: 'Remove User',
      message:
        'Are you sure you want to remove this user permanently? <span class="font-medium">This action cannot be undone!</span>',
      icon: this._formBuilder.group({
        show: true,
        name: 'heroicons_outline:exclamation-triangle',
        color: 'warn',
      }),
      actions: this._formBuilder.group({
        confirm: this._formBuilder.group({
          show: true,
          label: 'Remove',
          color: 'warn',
        }),
        cancel: this._formBuilder.group({
          show: true,
          label: 'Cancel',
        }),
      }),
      dismissible: true,
    });


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


    this._sessionStorageService.clearAll();
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
  this._router.navigate(['./'], {relativeTo: this._activatedRoute});
  }

  openAddInspectionDrawer(type: 'visitprofile'): void {
    this.matDrawer.open();
    this._router.navigate(['add-list-of-inspection'], { relativeTo: this._activatedRoute });
  }

  
  // openUpdateInspectionDrawer(type: 'visitprofile', element: any): void {
  //   console.log(element)
  //   this.matDrawer.open();
  //   this._router.navigate(['edit-list-of-inspection', element.inspectionCode], { relativeTo: this._activatedRoute,state: { element} });      
  // }
       
  // openUpdateUoMDrawer(type: 'visitprofile', element: any): void {
  //   this.matDrawer.open();
  //   this._router.navigate(['edit-unit-measure-setup', element.uomCode], { relativeTo: this._activatedRoute, state: { element} });   
  // }

  openStepperToUpdateICH(rowDataICH: any): void {
    console.log('SENDING DATA:', rowDataICH);
    const dataToSendIntoStepperICH = {
      ...rowDataICH, isEditMode: true // Send isEditMode as true
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
}
