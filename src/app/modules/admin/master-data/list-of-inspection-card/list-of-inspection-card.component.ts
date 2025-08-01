import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
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
import { InspectionCardService } from 'app/core/other-core-services/module/inspection-card.service';
import { SessionStorageService } from 'app/core/other-core-services/module/session-storage.service';
import { debounceTime } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Location } from '@angular/common';

@Component({
    selector: 'app-list-of-inspection-card',
    standalone: true,
    templateUrl: './list-of-inspection-card.component.html',
    styleUrl: './list-of-inspection-card.component.scss',
    encapsulation: ViewEncapsulation.None,
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
        MatSidenavModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        NgClass,
        NgTemplateOutlet,
        ReactiveFormsModule,
        RouterOutlet,
    ],
})
export class ListOfInspectionCardComponent implements OnInit, OnDestroy {
    searchInputControl = new FormControl('');
    configForm: UntypedFormGroup;

    title = 'List Of Inspection Cards';
    addBtnTitle = 'Add';
    addUserBtn = 'Add';

    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
    drawerMode: 'side' | 'over';

    displayedColumns: string[] = [
        'serialId',
        'intCode',
        'description',
        'isActive',
        'action',
    ];
    dataSource = new MatTableDataSource<any>([]);

    @ViewChild(MatPaginator) paginator: MatPaginator;

    constructor(
        private _formBuilder: UntypedFormBuilder,
        private _qbsConfirmationService: QbsConfirmationService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _inspectionCard: InspectionCardService,
        private _sessionStorageService: SessionStorageService,
        private _location: Location,
    ) { }

    ngOnInit(): void {
        // this._inspectionCard.getInspectionCard().subscribe((inspectionCharacteristic) => {
        //     this.dataSource = inspectionCharacteristic.data          
        // });

        this._inspectionCard.getInspectionCard().subscribe((response) => {
            this.dataSource = new MatTableDataSource(response.data);
            // this.dataSource.paginator = this.paginator;
        });

        // CUSTOM FILTER FOR SEARCH
        this.dataSource.filterPredicate = (data: any, filter: string) => {
            const searchText = filter.toLowerCase();
            return data.intCode?.toString().toLowerCase().includes(searchText) ||
                data.description?.toString().toLowerCase().includes(searchText) ||
                data.type?.toString().toLowerCase().includes(searchText) ||
                (data.isActive ? 'active' : 'inactive').includes(searchText);
        };

        // SEARCH WITH COMPLETE PAYLOAD VALUES
        this.searchInputControl.valueChanges
            .pipe(debounceTime(300))
            .subscribe((searchTerm: string) => {
                this.applyFilter(searchTerm);
            });

        // SEARCH WITH THE SPECIFIC PAYLOAD VALUES
        // Override the default filterPredicate
        // this.dataSource.filterPredicate = (data: User, filter: string) => {
        //     const transformedFilter = filter.trim().toLowerCase();
        //     // You can add more fields for filtering by expanding the condition below
        //     return (
        //         // data.name.toLowerCase().includes(transformedFilter) ||
        //         data.email.toLowerCase().includes(transformedFilter) ||
        //         data.phone.toLowerCase().includes(transformedFilter) ||
        //         data.department.toLowerCase().includes(transformedFilter)
        //     );
        // };

        // Subscribe to search input field value changes to filter the table data
        // this.searchInputControl.valueChanges.pipe(debounceTime(300)).subscribe((searchTerm: string) => {
        //     this.applyFilter(searchTerm);
        // });
        this._sessionStorageService.clearAll();
    }

    ngOnDestroy(): void {
        // this._sessionStorageService.clearAll();
    }

    ngAfterViewInit() {
        // this.dataSource.paginator = this.paginator;
    }

    ngAfterViewChecked() {
        if (this.dataSource && this.paginator && this.dataSource.paginator !== this.paginator) {
            this.dataSource.paginator = this.paginator;
        }
    }

    applyFilter(searchTerm: string): void {
        searchTerm = searchTerm.trim().toLowerCase();
        this.dataSource.filter = searchTerm;
    }

    onBackdropClicked(): void {
        console.log('On Back Drop Clicked');
        this.matDrawer.close();
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
    }

    openAddInspectionDrawer(type: 'visitprofile'): void {
        this.matDrawer.open();
        this._router.navigate(['add-inspection-card'], {
            relativeTo: this._activatedRoute,
        });
    }

    openStepperToUpdateIC(rowDataIC: any): void {
        console.log('SENDING DATA:', rowDataIC);
        const dataToSendIntoStepperIC = {
            ...rowDataIC, isEditMode: true
        };
        sessionStorage.setItem('stepperDataIC', JSON.stringify(dataToSendIntoStepperIC));
        this._router.navigate(['/master-data/list-of-testing-stepper'], {
            queryParams: { step: 4 }
        });
    }

    openStepperToCloneIC(rowDataIC: any): void {
        console.log('SENDING DATA:', rowDataIC);
        const dataToSendIntoStepperIC = {
            ...rowDataIC, isEditMode: true, isCloneIC: true
        };
        sessionStorage.setItem('stepperDataIC', JSON.stringify(dataToSendIntoStepperIC));
        this._router.navigate(['/master-data/list-of-testing-stepper'], {
            queryParams: { step: 4 }
        });
    }

    openStepperToAddIC(): void {
        sessionStorage.removeItem('stepperDataIC');
        this._router.navigate(['/master-data/list-of-testing-stepper'], {
            queryParams: { step: 4 }
        });
    }

    onBackArrowClick(): void {
        this._location.back();
    }
}

// openUpdateInspectionDrawer(type: 'visitprofile', element: any): void {
//     console.log(element)
//     this.matDrawer.open();
//     this._router.navigate(['edit-inspection-card', element], { relativeTo: this._activatedRoute, state: { element } });
// }

// openUpdateInspectionDrawer(type: 'visitprofile', element: any): void {
//     this.matDrawer.open();
//     // console.log(element.cardCode);
//     // console.log(element);
//     this._router.navigate(['edit-inspection-card', element.cardCode], {
//         relativeTo: this._activatedRoute,
//         state: { element },
//     });
//     return;
// }