import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
import { ApprovalTemplateManagementService } from 'app/core/other-core-services/administrator/approval-template-management.service';

@Component({
  selector: 'app-add-approval-template',
  standalone: true,
  templateUrl: './add-approval-template.component.html',
  styleUrl: './add-approval-template.component.scss',
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
    MatAutocompleteModule
  ],
})
export class AddApprovalTemplateComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

  users: any = [];
  modules: any = [];
  addApprovalForm: FormGroup;
  errorMessage: string | null = null; 
  rows: { userName: string, userId: string }[] = [{ userName: '', userId: '' }];


  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _approvalTemplateComponent: ApprovalTemplateComponent,
    private _approvalTemplateManagementService: ApprovalTemplateManagementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this._approvalTemplateManagementService.listAllUsers().subscribe(users => {
      this.users = users.data;
    });

    this._approvalTemplateManagementService.listAllModules().subscribe(modules => {
      this.modules = modules.data;
      const modulesArray = modules.data.map(module =>
        this.fb.group({
          id: [0],
          moduleCode: [module.code || ''],
          moduleName: [module.name || ''],
          isAllowed: [false]
        })
      );
      this.addApprovalForm.setControl('modules', this.fb.array(modulesArray));
    })
  }

  ngAfterViewInit(): void {
    this.originators.valueChanges.subscribe(() => {
      this.checkLastRowCompletion(this.originators);
    })

    this.approvers.valueChanges.subscribe(() => {
      this.checkLastRowCompletion(this.approvers);
    });
  }

  ngOnDestroy(): void {}

  initializeForm() {
    this.addApprovalForm = this.fb.group({
      name: [''],
      noApprovals: [0],
      isActive: [false],
      originators: this.fb.array([
        this.createRow()
      ]),
      approvers: this.fb.array([
        this.createApproverRow()
      ]),
      modules: this.fb.array([])
    });
  }

  // createRow(): FormGroup {
  //   const row = this.fb.group({
  //     userName: [''],
  //     userId: ['']
  //   });

  //   // Subscribe to changes in the `userName` field
  //   row.get('userName')?.valueChanges.subscribe(value => {
  //     if (!value) {
  //       const rowIndex = this.originators.controls.indexOf(row);
  //       if (rowIndex > -1) {
  //         this.removeRow(rowIndex);
  //       }
  //     }
  //   });

  //   return row;
  // }
  createRow(): FormGroup {
    return this.createUserRow();
  }
  

  get originators(): FormArray {
    return this.addApprovalForm.get('originators') as FormArray;
  }
 
  addRow() {
    this.originators.push(this.createRow());
    this.errorMessage = null;
  }

  removeRow(index: number): void {
    if (this.originators.length > 1) {
      this.originators.removeAt(index);
    }
    this.errorMessage = null; 
  }

   // Approvers methods
  createApproverRow(): FormGroup {
    return this.createUserRow();
  }

  get approvers(): FormArray {
    return this.addApprovalForm.get('approvers') as FormArray;
  }

  addApproverRow(): void {
    this.approvers.push(this.createApproverRow());
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

  get modulesFormArray(): FormArray {
    return this.addApprovalForm.get('modules') as FormArray;
  }

  checkLastRowCompletion(array: FormArray): void {
    const lastRow = array.at(array.length - 1) as FormGroup;
    if (lastRow.get('userName')?.value && lastRow.get('userId')?.value) {
      array === this.originators ? this.addRow() : this.addApproverRow();
    }
  }
  

  onUserSelected(event: any, row: FormGroup) {
    const selectedUser = this.users.find(user => user.userName === event.option.value);
    
    if (!selectedUser) return;
  
    const userExistsInOriginators = this.originators.controls.some(r => r.get('userId')?.value === selectedUser?.userId);
    const userExistsInApprovers = this.approvers.controls.some(r => r.get('userId')?.value === selectedUser?.userId);
  
    if (userExistsInOriginators && this.approvers.controls.includes(row)) {
      // User exists in Originators and is being added to Approvers
      row.patchValue({ userName: null, userId: null });
      this.cdr.detectChanges();
      alert(`User "${selectedUser?.userName}" already exists in the originators table.`);
    } else if (userExistsInApprovers && this.originators.controls.includes(row)) {
      // User exists in Approvers and is being added to Originators
      row.patchValue({ userName: null, userId: null });
      this.cdr.detectChanges();
      alert(`User "${selectedUser?.userName}" already exists in the approvers table.`);
    } else if (selectedUser) {
      // User is not in any conflicting table, proceed
      row.patchValue({ userName: selectedUser.userName, userId: selectedUser.userId });
      const isOriginatorRow = this.originators.controls.includes(row);
      this.checkLastRowCompletion(isOriginatorRow ? this.originators : this.approvers);
    }
  }


  onSubmit(): void {
    if (this.addApprovalForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Filter out rows where both userName and userId are empty
    const filteredOriginators = this.originators.value.filter(
    (row: { userName: string; userId: string }) => row.userName.trim() !== '' || row.userId.trim() !== ''
     );

    const filteredApprovers = this.approvers.value.filter(
      (row: { userName: string; userId: string }) => row.userName.trim() !== '' || row.userId.trim() !== ''
    );

    const selectedModules = this.modulesFormArray.value.map((module: any) => ({
      id: 0,
      moduleCode: module.moduleCode,
      moduleName: module.moduleName,
      isAllowed: module.isAllowed
    }));


     const payload = {
      id: 0,
      ...this.addApprovalForm.value,
      originators: filteredOriginators,
      approvers: filteredApprovers, 
      modules: selectedModules
    };

    console.log('Add Approval Template Payload', payload)

    this._approvalTemplateManagementService.addApprovalTemplate(payload).subscribe({

      next: (response) => {
        if(response.statusCode == 422) {
          console.error('Failed to add template', response.error);
        } else {
          console.log('Template added successfully', response);
          this._approvalTemplateComponent.matDrawer.close();
          this._router.navigate(['../'], { relativeTo: this._activatedRoute });
        }
      },
      error: (error) => {
        console.error('Error adding template', error);
        this.errorMessage = 'Failed to add the approval template. Please try again.';
      }
    })

    // this._approvalTemplateManagementService.addApprovalTemplate(payload).subscribe(
    //   response => {
    //     console.log('Template added successfully', response);
    //     this._approvalTemplateComponent.matDrawer.close();
    //     this._router.navigate(['../'], { relativeTo: this._activatedRoute });
    //   },
    //   error => {
    //     console.error('Error adding template', error);
    //     this.errorMessage = 'Failed to add the approval template. Please try again.';
    //   }
    // );
  }

}
