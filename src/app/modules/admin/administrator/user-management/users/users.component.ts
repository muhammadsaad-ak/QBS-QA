import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { debounceTime } from 'rxjs/operators';
import { UserManagementService } from 'app/core/other-core-services/administrator/user-management.service';
import { UserList } from '../user-management.types';


@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
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
export class UsersComponent implements OnInit, OnDestroy {

  configForm: UntypedFormGroup;
  searchInputControl: UntypedFormControl = new UntypedFormControl();

  addUserBtn = "Add User";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';


  displayedColumns: string[] = ['id', 'userName', 'email', 'phone', 'branch', 'role', 'department', 'action'];
  dataSource = new MatTableDataSource<UserList>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  constructor(
    private _userManagementService : UserManagementService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _qbsConfirmationService: QbsConfirmationService,
    private _formBuilder: UntypedFormBuilder,
   ){}
  
  onBackdropClicked(): void {
    console.log('On Back Drop Clicked')
    this.matDrawer.close();
  this._router.navigate(['./'], {relativeTo: this._activatedRoute});
  }

  ngOnInit(): void {

    this._userManagementService.users$.subscribe(users => {
      this.dataSource.data = users;
  });
    
    this._userManagementService.getUsersList().subscribe(users => {
      this.dataSource.data = users; 
    });

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

  // Method to apply filter on the dataSource
  applyFilter(searchTerm: string): void {
      searchTerm = searchTerm.trim().toLowerCase(); // Remove whitespace and make lowercase
      this.dataSource.filter = searchTerm; // Apply filter (MatTableDataSource handles filtering)
    }

  openAddUserDrawer(type: 'visitprofile'): void {
    this.matDrawer.open();
    this._router.navigate(['add-user'], { relativeTo: this._activatedRoute });
  }

  openUpdateUserDrawer(type: 'visitprofile', id: string): void {
    this.matDrawer.open();
    this._router.navigate(['edit-user', id], { relativeTo: this._activatedRoute });   
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


// export interface User {
//   id: number;
//   email: string;
//   name: string;
//   phone: string;
//   department: string;
//   action: string; 
// }

// const USER_DATA: User[] = [
//   {id: 1, email: 'john.doe@example.com', fullName: 'John Doe', phone: '+1234567890', department: 'HR', action: ' '},
//   {id: 2, email: 'jane.smith@example.com', fullName: 'Jane Smith', phone: '+0987654321', department: 'Engineering', action: ' '},
//   {id: 3, email: 'sam.wilson@example.com', fullName: 'Sam Wilson', phone: '+1122334455', department: 'Finance', action: ' '},
//   {id: 4, email: 'kate.jones@example.com', fullName: 'Kate Jones', phone: '+2233445566', department: 'Marketing', action: ' '},
//   {id: 5, email: 'paul.brown@example.com', fullName: 'Paul Brown', phone: '+3344556677', department: 'Sales', action: ' '},
//   {id: 6, email: 'emma.green@example.com', fullName: 'Emma Green', phone: '+4455667788', department: 'IT', action: ' '},
//   {id: 7, email: 'mike.white@example.com', fullName: 'Mike White', phone: '+5566778899', department: 'Operations', action: ' '},
//   {id: 8, email: 'sara.black@example.com', fullName: 'Sara Black', phone: '+6677889900', department: 'Support', action: ' '},
//   {id: 9, email: 'david.clark@example.com', fullName: 'David Clark', phone: '+7788990011', department: 'Legal', action: ' '},
//   {id: 10, email: 'linda.adams@example.com', fullName: 'Linda Adams', phone: '+8899001122', department: 'Admin', action: ' '}
// ];