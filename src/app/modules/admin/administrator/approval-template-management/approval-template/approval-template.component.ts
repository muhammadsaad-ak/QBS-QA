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
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { ApprovalTemplateManagementService } from 'app/core/other-core-services/administrator/approval-template-management.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-approval-template',
  standalone: true,
  templateUrl: './approval-template.component.html',
  styleUrl: './approval-template.component.scss',
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
export class ApprovalTemplateComponent implements OnInit, OnDestroy {

  configForm: UntypedFormGroup;
  searchInputControl: UntypedFormControl = new UntypedFormControl();

  addApprovalBtn = "Add Approval";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';


  displayedColumns: string[] = ['id', 'name', 'noApprovals', 'isActive', 'action'];
  dataSource = new MatTableDataSource<ApprovalTemplate>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _qbsConfirmationService: QbsConfirmationService,
    private _formBuilder: UntypedFormBuilder,
    private _approvalTemplateManagementService: ApprovalTemplateManagementService,
   ){}
  
  onBackdropClicked(): void {
    console.log('On Back Drop Clicked')
    this.matDrawer.close();
  this._router.navigate(['./'], {relativeTo: this._activatedRoute});
  }

  ngOnInit(): void {

    // this._approvalTemplateManagementService.templates$.subscribe(templates => {
    //   this.dataSource.data = templates;
    // });

    this._approvalTemplateManagementService.templates$.subscribe(templates => {
      this.dataSource.data = templates;
    });

   
    this._approvalTemplateManagementService.listAllApprovalTemplates().subscribe(templates => {
      this.dataSource.data = templates.data;
    })

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
  }

  ngOnDestroy(): void {
    
  }

  applyFilter(searchTerm: string): void {
    searchTerm = searchTerm.trim().toLowerCase(); // Remove whitespace and make lowercase
    this.dataSource.filter = searchTerm; // Apply filter (MatTableDataSource handles filtering)
  }


  addApproval(type: 'visitprofile'): void {
    this.matDrawer.open();
    this._router.navigate(['add-approval-template'], { relativeTo: this._activatedRoute });
  }

  openUpdateATDrawer(type: 'visitprofile', id: string): void {
    this.matDrawer.open();
    this._router.navigate(['edit-approval-template', id], { relativeTo: this._activatedRoute });   
  }

   /**
     * Open confirmation dialog
     */
   deleteUser(type: 'visitprofile'): void {
    // Open the dialog and save the reference of it
    const dialogRef = this._qbsConfirmationService.open(
        this.configForm.value
    );

    // Subscribe to afterClosed from the dialog reference
    dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
    });
}


}


export interface ApprovalTemplate {
  id: number;
  name: string;
  noOfApprovals: number;
  isActive: boolean;
  approvers: [];
  originators: []; 
  modules: [];
  action: string;
}

// const USER_DATA: User[] = [
//   {id: 1, name: 'John Doe', description: 'HR Manager', noOfApprovals: 5, active: true, action: ' '},
//   {id: 2, name: 'Jane Smith', description: 'Software Engineer', noOfApprovals: 3, active: true, action: ' '},
//   {id: 3, name: 'Sam Wilson', description: 'Accountant', noOfApprovals: 2, active: false, action: ' '},
//   {id: 4, name: 'Kate Jones', description: 'Marketing Lead', noOfApprovals: 4, active: true, action: ' '},
//   {id: 5, name: 'Paul Brown', description: 'Sales Executive', noOfApprovals: 6, active: true, action: ' '},
//   {id: 6, name: 'Emma Green', description: 'IT Support', noOfApprovals: 3, active: false, action: ' '},
//   {id: 7, name: 'Mike White', description: 'Operations Manager', noOfApprovals: 8, active: true, action: ' '},
//   {id: 8, name: 'Sara Black', description: 'Customer Support', noOfApprovals: 1, active: true, action: ' '},
//   {id: 9, name: 'David Clark', description: 'Legal Advisor', noOfApprovals: 7, active: false, action: ' '},
//   {id: 10, name: 'Linda Adams', description: 'Admin Officer', noOfApprovals: 9, active: true, action: ' '}
// ];
