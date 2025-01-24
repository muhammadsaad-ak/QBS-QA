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
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-unit-measure-setup',
  standalone: true,
  templateUrl: './unit-measure-setup.component.html',
  styleUrl: './unit-measure-setup.component.scss',
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
export class UnitMeasureSetupComponent implements OnInit, OnDestroy {

  
      configForm: UntypedFormGroup;
      searchInputControl: UntypedFormControl = new UntypedFormControl();
    
      addUserBtn = "Add UoM";
    
      @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
      drawerMode: 'side' | 'over';
    
    
      List_Of_Inspection_Data= [
        { uomCode: 'KG', uomName: 'Kilogram' },
        { uomCode: 'GM', uomName: 'Gram' },
        { uomCode: 'LTR', uomName: 'Liter' },
        { uomCode: 'ML', uomName: 'MilliLiter' },
      ];
      
      displayedColumns: string[] = ['serialId', 'uomCode', 'uomName', 'action'];
      dataSource = new MatTableDataSource<any>(this.List_Of_Inspection_Data);
      // dataSource = new MatTableDataSource<any>([]);
      
      @ViewChild(MatPaginator) paginator: MatPaginator;
    
       ngAfterViewInit() {
         this.dataSource.paginator = this.paginator;
       }
    
      constructor(
        private _formBuilder: UntypedFormBuilder,
        private _qbsConfirmationService: QbsConfirmationService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
      ) { } 
    
       ngOnInit(): void {
    
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
    
    
      onBackdropClicked(): void {
        console.log('On Back Drop Clicked')
        this.matDrawer.close();
      this._router.navigate(['./'], {relativeTo: this._activatedRoute});
      }
    
      openAddInspectionDrawer(type: 'visitprofile'): void {
        this.matDrawer.open();
        this._router.navigate(['add-unit-measure-setup'], { relativeTo: this._activatedRoute });
      }
    
      
      openUpdateInspectionDrawer(type: 'visitprofile', id: string): void {
        this.matDrawer.open();
        this._router.navigate(['edit-unit-measure-setup', id], { relativeTo: this._activatedRoute });   
      }
    
      /**
         * Open confirmation dialog
         */
    //   deleteUser(type: 'visitprofile'): void {
    //     // Open the dialog and save the reference of it
    //     const dialogRef = this._qbsConfirmationService.open(
    //         this.configForm.value
    //     );
    
    //     // Subscribe to afterClosed from the dialog reference
    //     dialogRef.afterClosed().subscribe((result) => {
    //         console.log(result);
    //     });
    // }
    
  
  

}
