import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { UsersComponent } from '../users.component';
import { UserManagementService } from 'app/core/other-core-services/administrator/user-management.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [AsyncPipe, CommonModule, DatePipe, FormsModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatDatepickerModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSortModule, MatSlideToggleModule, MatTabsModule, MatTooltipModule, NgClass, NgTemplateOutlet, ReactiveFormsModule, RouterLink, RouterOutlet, TextFieldModule],
})
export class EditUserComponent implements OnInit, AfterViewInit, OnDestroy {


  editMode: boolean = false;
  editUsersForm: FormGroup


  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _usersListComponent: UsersComponent,
    private _userManagementService: UserManagementService
  ) {
    //Create form
    this.editUsersForm = this.fb.group({
      id: [null],
      // code: [''],
      userName: [''],
      password: [''],
      fullName: ['dsas'],
      role: [''],
      email: [''],
      department: [''],
      country: [''],
      branch: [''],
      phone1: [''],
      phone2: [''],
      // lastLogin: [''],
      // lastPasswordChange: [''],
      address: [''],
      isSuperUser: [''],
      isLocked: [''],
      isScreenLock: [''],
      // allowSapPosting: [''],
    })
  }

  ngOnInit(): void {
    this._activatedRoute.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.fetchUserData(id); // Fetch the employee data based on the ID
      }
      // this._userManagementService.getUser(id).subscribe((user) => {
      //   this.editUsersForm.patchValue(user);
      // });
    })
  }

  fetchUserData(id: number): void {
    // Search for the user in the active user list by ID
    const activeUser = this._usersListComponent.dataSource.data.find(user => user.id == id);

    if (activeUser) {
      // Patch the active user details into the form
      this.editUsersForm.patchValue({
        id: activeUser.id,
        userName: activeUser.userName || 'NA',
        password: activeUser.password || 'NA',
        role: activeUser.role || 'NA',
        email: activeUser.email || 'NA',
        department: activeUser.department || 'NA',
        country: activeUser.country || 'NA',
        branch: activeUser.branch || 'NA',
        phone1: activeUser.phone1 || 'NA',
        phone2: activeUser.phone2 || 'NA',
        address: activeUser.address || 'NA',
        isSuperUser: activeUser.isSuperUser || false,
        isLocked: activeUser.isLocked || false,
        isScreenLock: activeUser.isScreenLock || false,
      });
      console.log('Active user details patched:', this.editUsersForm.value);
    } else {
      // No user found, show an alert or handle as needed
      alert('No user found with the provided ID.');
    }
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {

  }


  /**
 * Upload avatar
 *
 * @param fileList
 */
  uploadAvatar(fileList: FileList): void {
    console.log('uploaded avatar')
  }
  /**
  * Remove the avatar
  */
  removeAvatar(): void {
    // Update the contact
    console.log('remove avatar')
  }


  updateUser(): void {
    if (this.editUsersForm.valid) {
      const user = this.editUsersForm.value;

      this._userManagementService.updateUser(user).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this._usersListComponent.matDrawer.close();
          this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        },
        error: (error) => {
          console.error('Failed to update user:', error);
        }
      });
    } else {
      console.error('Form is invalid');
    }
  }


  /**
  * Toggle edit mode
  *
  * @param editMode
  */
  toggleEditMode(editMode: boolean | null = null): void {
    if (editMode === null) {
      console.log('editMode toggled');
      this.editMode = !this.editMode;
    } else {
      console.log('editMode set to:', editMode);
      this.editMode = editMode;
    }
    this._changeDetectorRef.detectChanges();
  }

}
