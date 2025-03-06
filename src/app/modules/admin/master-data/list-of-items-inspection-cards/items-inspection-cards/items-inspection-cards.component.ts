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
import { debounceTime, forkJoin } from 'rxjs';
import { ItemInspectionCardService } from 'app/core/other-core-services/module/item-inspection-card.service';

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

  ListIAlltemsInspectionCards = [];

  displayedColumnsItemsInspectionCards: string[] = ['serialId', 'itemCode', 'itemDescription', 'cardCode', 'action'];
  dataSourceItemsInspectionCards = new MatTableDataSource<any>(this.ListIAlltemsInspectionCards);
  // dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSourceItemsInspectionCards.paginator = this.paginator;
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _itemInspectionCardService: ItemInspectionCardService,

  ) { }

  ngOnInit(): void {
    forkJoin({
      inspectionCards: this._itemInspectionCardService.ListAllItemsInspectionCards(),
      items: this._itemInspectionCardService.getListAllItems()
    }).subscribe(({ inspectionCards, items }) => {

      // Convert item list to a map for quick lookup
      const itemMap = new Map(items.data.map(item => [item.id, item.itemCode]));

      // Map itemId to itemCode in the inspectionCards response
      this.ListIAlltemsInspectionCards = inspectionCards.data.map(card => ({
        ...card,
        itemCode: itemMap.get(card.itemId) || 'N/A' // Default to 'N/A' if not found
      }));

      // Assign updated data to table
      this.dataSourceItemsInspectionCards.data = this.ListIAlltemsInspectionCards;
    });

    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });
  }


  XngOnInit(): void {
    this._itemInspectionCardService.ListAllItemsInspectionCards().subscribe((items) => {
      this.dataSourceItemsInspectionCards.data = items.data;
    })

    // Check if there is updated data from navigation
    const navigationState = history.state.updatedData;
    if (navigationState) {
      const updatedData = navigationState;
      // Now update the ListIAlltemsInspectionCards with the new data
      this.ListIAlltemsInspectionCards = this.ListIAlltemsInspectionCards.map(item =>
        item.cardCode === updatedData.cardCode ? updatedData : item
      );
      // Refresh the table data source
      this.dataSourceItemsInspectionCards = new MatTableDataSource<any>(this.ListIAlltemsInspectionCards);
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
    this.dataSourceItemsInspectionCards.filter = searchTerm;
  }

  // addItemsInspectionCards(): void {
  //   this._router.navigate(['add-items-inspection-cards'], { relativeTo: this._activatedRoute });
  // }

  // actionEdittemsInspectionCards(rowDataIIC: any, inspectionCardId: string): void {
  //   this._router.navigate(['edit-items-inspection-cards', inspectionCardId],
  //     {
  //       relativeTo: this._activatedRoute,
  //       state: { rowDataIIC }
  //     });
  // }

  openStepperToUpdateIIC(rowDataIIC: any): void {
    console.log('SENDING IIC DATA:', rowDataIIC);
    sessionStorage.setItem('stepperDataIIC', JSON.stringify(rowDataIIC));
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 4 }
    });
  }

  openStepperToAddIIC(): void {
    sessionStorage.removeItem('stepperDataIIC');
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 4 }
    });
  }
}
