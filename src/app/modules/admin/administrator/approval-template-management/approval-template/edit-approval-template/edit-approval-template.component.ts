import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { ApprovalTemplateComponent } from '../approval-template.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ApprovalTemplateManagementService } from 'app/core/other-core-services/administrator/approval-template-management.service';
import { response } from 'express';

@Component({
  selector: 'app-edit-approval-template',
  standalone: true,
  templateUrl: './edit-approval-template.component.html',
  styleUrl: './edit-approval-template.component.scss',
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
    MatAutocompleteModule,
  ],
})
export class EditApprovalTemplateComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

  users: any[] = [];
  modules: any[] = [];
  editMode: boolean = false;
  errorMessage: string = '';
  editApprovalTemplateForm!: FormGroup;
  rows: { userName: string, userId: string }[] = [{ userName: '', userId: '' }];
  
  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _approvalTemplateComponent: ApprovalTemplateComponent,
    private _approvalTemplateManagementService: ApprovalTemplateManagementService
  ) { }


  ngOnInit(): void {
    this.initializeForm();

    this._approvalTemplateManagementService.listAllUsers().subscribe((users) => {
      this.users = users.data;
    });

    this._approvalTemplateManagementService.listAllModules().subscribe((modules) => {
      this.modules = modules.data;
      const modulesArray = modules.data.map((module) =>
        this.fb.group({
          id: [module.id || 0],
          moduleCode: [module.code || ''],
          moduleName: [module.name || ''],
          isAllowed: [{ value: module.isAllowed || false, disabled: true }] // Read-only view
        })
      );
      this.editApprovalTemplateForm.setControl('modules', this.fb.array(modulesArray));
    });

    const id = this._activatedRoute.snapshot.params['id'];
    this.loadTemplateDetails(id);
    
  }


  ngAfterViewInit(): void {
    this.originators.valueChanges.subscribe(() => {
      this.checkLastRowCompletion(this.originators);
    });

    this.approvers.valueChanges.subscribe(() => {
      this.checkLastRowCompletion(this.approvers);
    });
  }

  initializeForm(): void {
    this.editApprovalTemplateForm = this.fb.group({
      id: [0],
      name: [''],
      noApprovals: [0],
      isActive: [false],
      originators: this.fb.array([]),
      approvers: this.fb.array([]),
      modules: this.fb.array([]),
    })
  }

  onEditTemplate(id: number): void {
    this.loadTemplateDetails(id);
  }

  loadTemplateDetails(id: number): void {
    this._approvalTemplateManagementService.getApprovalTemplateById(id).subscribe((templateData) => {
      const template = templateData.data;


      this.editApprovalTemplateForm.patchValue({
        id: template.id,
        name: template.name,
        noApprovals: template.noApprovals,
        isActive: template.isActive
      });

      const originatorsArray = template.originators.map((originator) =>
        this.createRow(originator)
      );
      const approversArray = template.approvers.map((approver) =>
        this.createRow(approver)
      );

      this.editApprovalTemplateForm.setControl('originators', this.fb.array(originatorsArray));
      this.editApprovalTemplateForm.setControl('approvers', this.fb.array(approversArray));
      
      const modulesArray = template.modules.map((module) =>
      this.fb.group({
        id: [module.id || 0],
        moduleCode: [module.moduleCode || ''],
        moduleName: [module.moduleName || ''],
        isAllowed: [{ value: module.isAllowed || false, disabled: true } ] // Set read-only view if needed
        })
      );
      this.editApprovalTemplateForm.setControl('modules', this.fb.array(modulesArray));

      this._changeDetectorRef.detectChanges();
    });

  }

  get originators(): FormArray {
    return this.editApprovalTemplateForm.get('originators') as FormArray;
  }

  get approvers(): FormArray {
    return this.editApprovalTemplateForm.get('approvers') as FormArray;
  }

  get modulesFormArray(): FormArray {
    return this.editApprovalTemplateForm.get('modules') as FormArray;
  }


  createRow(data: any = {}): FormGroup {
    return this.fb.group({
      userName: [data.userName || ''],
      userId: [data.userId || ''],
      id: [data.id || 0],
      isSelected: [data.isSelected || true]
    });
  }

  createApproverRow(data: any = {}): FormGroup {
    return this.fb.group({
      userName: [data.userName || ''],
      userId: [data.userId || ''],
      id: [data.id || 0],
      isSelected: [data.isSelected || true]
    });
  }


  checkLastRowCompletion(array: FormArray): void {
    const lastRow = array.at(array.length - 1) as FormGroup;
    if (lastRow.get('userName')?.value && lastRow.get('userId')?.value) {
      array === this.originators ? this.addRow(this.originators) : this.addApproverRow(this.approvers);
    }
  }

  ngOnDestroy(): void {}


  addRow(originators: FormArray): void {
    originators.push(this.createRow());
    this.errorMessage = null;
  }

  addApproverRow(approvers: FormArray): void {
    approvers.push(this.createApproverRow());
    this.errorMessage = null;
  }

  removeApproverRow(index: number): void {
    if (this.approvers.length > 1) {
      this.approvers.removeAt(index);
    }
    this.errorMessage = null;
  }

     // Generic methods
     createUserRow(): FormGroup {
      const row = this.fb.group({
        userName: [''],
        userId: [''],
        id: [0],         
        isSelected: [true]
      });
  
      row.get('userName')?.valueChanges.subscribe(value => {
        if (!value) {
          const rowIndex = this.originators.controls.indexOf(row) !== -1 
            ? this.originators.controls.indexOf(row) 
            : this.approvers.controls.indexOf(row);
  
          if (rowIndex > -1) {
            this.originators.controls.indexOf(row) > -1
              ? this.removeRow(rowIndex)
              : this.removeApproverRow(rowIndex);
          }
        }
      });
  
      return row;
    }



  onUserSelected(event: any, row: FormGroup): void {
    const selectedUser = this.users.find((user) => user.userName === event.option.value);

    if (!selectedUser) return;

    const userExistsInOriginators = this.originators.controls.some(
      (r) => r.get('userId')?.value === selectedUser?.userId
    );
    const userExistsInApprovers = this.approvers.controls.some(
      (r) => r.get('userId')?.value === selectedUser?.userId
    );

    if (userExistsInOriginators && this.approvers.controls.includes(row)) {
      row.patchValue({ userName: null, userId: null });
      this._changeDetectorRef.detectChanges();
      alert(`User "${selectedUser?.userName}" already exists in the originators table.`);
    } else if (userExistsInApprovers && this.originators.controls.includes(row)) {
      row.patchValue({ userName: null, userId: null });
      this._changeDetectorRef.detectChanges();
      alert(`User "${selectedUser?.userName}" already exists in the approvers table.`);
    } else {
      row.patchValue({ userName: selectedUser.userName, userId: selectedUser.userId });
      this.checkLastRowCompletion(this.originators.controls.includes(row) ? this.originators : this.approvers);
    }
  }

  
  removeRow(index: number): void {
    if (this.originators.length > 1) {
      this.originators.removeAt(index);
    }
    this.errorMessage = null; 
  }

  // updateUser(): void {
  //   console.log('user added')
  //   // console.log(this.employeeListDetailsForm.value);
  //   this._approvalTemplateComponent.matDrawer.close();
  //   this._router.navigate(['../'], {relativeTo: this._activatedRoute});
  // }

  trackByIndex(index: number, item: any): number {
    return index;
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
      // this.loadInitialData();
      // this.loadTemplateDetails
       // Update the `isAllowed` control state in the modules array
      const modulesArray = this.editApprovalTemplateForm.get('modules') as FormArray;
      modulesArray.controls.forEach((group) => {
      const isAllowedControl = group.get('isAllowed');
      if (isAllowedControl) {
        if (this.editMode) {
          isAllowedControl.enable(); // Enable for editing
        } else {
          isAllowedControl.disable(); // Set back to read-only
        }
      }
    });
    }
    this._changeDetectorRef.detectChanges();
  }

  // Load initial data into the form (example data)
  // loadInitialData(): void {

  //   this.originatorRows = [
  //     { userName: 'Ozi', userCode:'abc' },
  //     { userName: 'Shayan', userCode: 'das' },
  //     { userName: 'Aka', userCode: 'pas' },
  //   ];
  

  //    // Log to confirm data loading
  // console.log('Initial Data Loaded:', this.originatorRows);
  //   // If you need to auto-select user-related data
  //   this.originatorRows.forEach(row => {
  //     const selectedUser = this.users.find(user => user.name === row.userName);
  //     if (selectedUser) {
  //       row.userName = selectedUser.name
  //       row.userCode = selectedUser.code;
  //     }
  //   });

  //   // Log for debugging purposes
  // console.log('Rows after loading data:', this.originatorRows);
  
  //   this.editApprovalTemplateForm.setValue({
  //     name: 'ABC AT',
  //     code: '4',
  //     active: true,
  //     vendor: true,
  //     item: false,
  //     fixedAsset: false,
  //     project: true,
  //     dff: false
  //   });

  //   console.log('Form Data:', this.editApprovalTemplateForm.value);
  // }
  

  // onUserSelected(event: any, row: any) {
  //   const selectedUser = this.users.find(user => user.name === event.option.value);

  //   if (selectedUser) {
  //     // Check if the selected user already exists in any other row
  //     const userExists = this.rows.some(r => r.userCode === selectedUser.code && r !== row);

  //     if (userExists) {
  //       // Clear the row and set an error message
  //       row.userName = '';
  //       row.userCode = '';
  //       // this.errorMessage = `User "${selectedUser.name}" already exists in the table.`;
  //     } else {
  //       // Set user code if not a duplicate
  //       row.userCode = selectedUser.code;
  //       this.errorMessage = null; // Clear any previous error message
  //     }
  //   }
  // }

  // Save function (for form submission)
  // save(): void {
  //   if (this.editApprovalTemplateForm.valid) {
  //     const formData = this.editApprovalTemplateForm.value;
  //     console.log('Form Data:', formData);
  //     // Additional logic for saving data can be added here (e.g., API call)

  //     // Toggle back to view mode after saving
  //     this.editMode = false;
  //   } else {
  //     console.log('Form is invalid!');
  //   }
  // }

  onSubmit(): void {
    if (this.editApprovalTemplateForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const filteredOriginators = this.originators.value.filter(
      (row: { userName: string; userId: string }) => row.userName.trim() !== '' || row.userId.trim() !== ''
    );
    const filteredApprovers = this.approvers.value.filter(
      (row: { userName: string; userId: string }) => row.userName.trim() !== '' || row.userId.trim() !== ''
    );

    const updatedModules = this.modulesFormArray.value.map((module: any) => ({
      id: module.id || 0,
      moduleCode: module.moduleCode,
      moduleName: module.moduleName,
      isAllowed: module.isAllowed
    }));

    const payload = {
      id: this.editApprovalTemplateForm.value.id,
      ...this.editApprovalTemplateForm.value,
      originators: filteredOriginators,
      approvers: filteredApprovers,
      modules: updatedModules
    };

    console.log('Edit Approval Template Payload', payload);

    this._approvalTemplateManagementService.updateApprovalTemplate(payload.id, payload).subscribe({
              
      next: (response) => {
        if(response.statusCode == 422) {
          console.error('Failed to update template', response.error);
        } else {
        console.log('Template updated successfully', response);
        this._approvalTemplateComponent.matDrawer.close();
        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        }
      },
      error: (error) => {
        console.error('Error updating template', error);
        this.errorMessage = 'Failed to update the approval template. Please try again.';
      }
      })

    // this._approvalTemplateManagementService.updateApprovalTemplate(payload.id, payload).subscribe(
    //   (response) => {
    //     console.log('Template updated successfully', response);
    //     this._approvalTemplateComponent.matDrawer.close();
    //     this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    //   },
    //   (error) => {
    //     console.error('Error updating template', error);
    //     this.errorMessage = 'Failed to update the approval template. Please try again.';
    //   }
    // );
  }


    // Mock Data
    getMockApprovalTemplate() {
      return {
        id: 14,
        name: 'testing approval',
        noApprovals: 6,
        isActive: true,
        originators: [
          { userName: 'tester 1122', userId: 3, id: 1, isSelected: true },
          { userName: 'api user', userId: 2, id: 2, isSelected: true },
        ],
        approvers: [
          { userName: 'tester 1122', userId: 3, id: 1, isSelected: true }
        ],
        modules: [
          { id: 1, moduleCode: '4', moduleName: 'ITEM', isAllowed: true },
          // { id: 0, moduleCode: '4', moduleName: 'ITEM', isAllowed: true },
          // { id: 0, moduleCode: '63', moduleName: 'Project', isAllowed: false },
          // { id: 0, moduleCode: 'DFF', moduleName: 'DFF', isAllowed: true },
        ],
      };
    }
}
