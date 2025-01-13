import { AsyncPipe, CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterLink, RouterOutlet, Router } from '@angular/router';
import { TextFieldModule } from '@angular/cdk/text-field';
import { UsersComponent } from '../users.component';
import { UserManagementService } from 'app/core/other-core-services/administrator/user-management.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    MatTooltipModule,
    AsyncPipe,
    CommonModule,
    DatePipe,
    QbsFindByKeyPipe,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDividerModule,
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
    MatSortModule,
    MatSlideToggleModule,
    MatTabsModule,
    NgClass,
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
    TextFieldModule,
  ],
})
export class AddUserComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;


  addUsersForm: FormGroup;

  constructor (
    private fb: FormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _usersListComponent: UsersComponent,
    private _userManagementService : UserManagementService,
  ) {
    //Add User
    this.addUsersForm = this.fb.group({
      // code: [''],
      userName: [''],
      password: [''],
      fullName: ['abc'],
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
      isSuperUser: [false],
      isLocked: [''],
      isScreenLock: [''],
      // allowSapPosting: [''],
    })
  }


  ngOnInit(): void {
    
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

addNewUser(): void {
  console.log('user added')
  // console.log(this.employeeListDetailsForm.value);
  const newUser = this.addUsersForm.value;

  this._userManagementService.addUser(newUser).subscribe({
    next: (response) => {
        if(response.statusCode == 422) {
          console.error('Failed to add user:', response.error);
        } 
        console.log('New user added successfully:', response);
                
        this._usersListComponent.matDrawer.close();
        this._router.navigate(['../'], {relativeTo: this._activatedRoute});
    },
    error: (error) => {
        console.error('Failed to add user:', error);
        // Optionally display error notification
    }
  })

}



}
