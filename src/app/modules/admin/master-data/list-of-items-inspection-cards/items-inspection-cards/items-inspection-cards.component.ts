import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
  selector: 'app-items-inspection-cards',
  standalone: true,
  templateUrl: './items-inspection-cards.component.html',
  styleUrl: './items-inspection-cards.component.scss',
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
export class ItemsInspectionCardsComponent {
  configForm: UntypedFormGroup;
  searchInputControl: UntypedFormControl = new UntypedFormControl();

  addBtnTitle = "Add";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over';

  dataList_ItemsInspectionCards = [
    {
      itemCode: 'ITM0000001', itemDescription: 'itemDescription1', cardCode: 'cardCode001', cardDescription: 'cardDescription1', isActive: true,
      qualitativeInspectionArray: [
        {
          parameter: "Color Shade",
          passCriteria: "As per standard",
          isMandotary: false,
          pass: "Moderate",
          fail: "Pathetic",
          minorDefect: "1"
        },
        {
          parameter: "Dental Damage",
          passCriteria: "Essential",
          sampleSize: true,
          pass: "Yes",
          fail: "No",
        },
      ],
      quantitativeInspectionArray: [
        {
          parameter: "Color Shade",
          uom: "KG",
          isMandotary: false,
          target: 30,
          max: +5,
          min: -2,
          // passCriteria: { target: 30, max: +5, min: -2, }
        },
      ]
    },
    {
      itemCode: 'ITM0000002', itemDescription: 'itemDescription2', cardCode: 'cardCode002', cardDescription: 'cardDescription2', isActive: true,
      qualitativeInspectionArray: [
        {
          parameter: "Color Shade",
          passCriteria: "As per standard",
          isMandotary: false,
          pass: "Moderate",
          fail: "Pathetic",
          minorDefect: "1"
        },
        {
          parameter: "Dental Damage",
          passCriteria: "Essential",
          sampleSize: true,
          pass: "Yes",
          fail: "No",
        },
      ],
      quantitativeInspectionArray: [
        {
          parameter: "Color Shade",
          uom: "KG",
          isMandotary: false,
          target: 30,
          max: +5,
          min: -2,
          // passCriteria: { target: 30, max: +5, min: -2, }
        },
      ]
    },

  ];

  displayedColumns: string[] = ['serialId', 'itemCode', 'itemDescription', 'cardCode', 'action'];
  dataSource_ItemsInspectionCards = new MatTableDataSource<any>(this.dataList_ItemsInspectionCards);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource_ItemsInspectionCards.paginator = this.paginator;
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // Check if there is updated data from navigation
    const navigationState = history.state.updatedData;
    if (navigationState) {
      const updatedData = navigationState;
      // Now update the dataList_ItemsInspectionCards with the new data
      this.dataList_ItemsInspectionCards = this.dataList_ItemsInspectionCards.map(item =>
        item.cardCode === updatedData.cardCode ? updatedData : item
      );
      // Refresh the table data source
      this.dataSource_ItemsInspectionCards = new MatTableDataSource<any>(this.dataList_ItemsInspectionCards);
    }


    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });
  }

  ngOnDestroy(): void { }


  applyFilter(searchTerm: string): void {
    searchTerm = searchTerm.trim().toLowerCase();
    this.dataSource_ItemsInspectionCards.filter = searchTerm;
  }

  addItemsInspectionCards(): void {
    this._router.navigate(['add-items-inspection-cards'], { relativeTo: this._activatedRoute });
  }

  actionEdittemsInspectionCards(itemData: any): void {
    this._router.navigate(['edit-items-inspection-cards', itemData.cardCode],
      {
        relativeTo: this._activatedRoute,
        state: { itemData }
      });

  }
}
