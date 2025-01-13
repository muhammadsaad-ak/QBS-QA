import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
//
import { ViewEncapsulation } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
// 
import { qbsAnimations } from '@qbs/animations';
import { ItemsMaster } from './item-master.types';
import { ItemMasterService } from 'app/core/other-core-services/module/item-master.service';
// 

export interface PeriodicElement {
  // GENERAL - BASIC INFORMATION
  seriesid: number,
  itemNo: string,
  description: string,
  foreignName: string,
  itemGroupid: number,
  uOMGroupId: number,
  // GENERAL - ITEM TYPE
  itemId: number,
  isInventoryItem: boolean,
  isSalesItem: boolean,
  isPurchasingItem: boolean,
  // GENERAL - PREFERENCES
  manufacturerId: number,
  shippingType: number,
  advanceRuleTypeId: number,
  regionId: number,
  isActive: boolean,
  isActiveFromDate: Date,
  isActiveToDate: Date,
  isActiveRemarks: string,
  isInactive: boolean,
  isInactiveFromDate: Date,
  isInactiveToDate: Date,
  isInactiveRemarks: string,
  // GENERAL - ITEMS CLASSIFICATION
  standardItemIdentificationId: number,
  commodityClassificationId: number,
}

@Component({
  selector: 'app-item-master',
  standalone: true,
  templateUrl: './item-master.component.html',
  styleUrl: './item-master.component.scss',
  animations: qbsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    RouterOutlet,
    MatInputModule,
    MatSortModule,
    MatTabsModule,
    ReactiveFormsModule,
    FormsModule,
    MatPaginatorModule,
    MatMenuModule,
    MatSidenavModule,
    MatButtonModule,
    CommonModule,
    AsyncPipe
  ],
})
// 
export class ItemMasterComponent implements OnInit {
  
  title: "Item Master Data";
  addBtnHoveredTitle = "Add Item";
  resetFilterBtnHoveredTitle = "Clear Filters";
  isBtnHovered: boolean = false;
  isResetFilterHovered: boolean = false;
  isLoading: boolean = false;

  searchInputControl: UntypedFormControl = new UntypedFormControl();

  displayedColumns: string[] = [
    'serial',
    'itemCode',
    'itemName',
    'itemType',
    'itemsGroupCode',
    'uoMGroupEntry',
    'actions'
  ];
  dataSource = new MatTableDataSource<ItemsMaster>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _itemMasterService: ItemMasterService,
  ) { }


  ngOnInit(): void {
    this._itemMasterService.getAllItems().subscribe((items) => {
      this.dataSource.data = items.data;
    })

    this.searchInputControl.valueChanges
    .pipe(debounceTime(300))
    .subscribe((searchTerm: string) => {
      this.applyFilter(searchTerm);
    });
  
  }


  applyFilter(searchTerm: string): void {
    searchTerm = searchTerm.trim().toLowerCase(); // Remove whitespace and make lowercase
    this.dataSource.filter = searchTerm; // Apply filter (MatTableDataSource handles filtering)
  }
 

  actionEditItemData(itemData: any): void {
    console.log(itemData);
    this._router.navigate(['edit-item-master'], { state: { data: itemData }, relativeTo: this._activatedRoute });
  }



  actionDeleteItem(itemNo: string): void {
    alert('DELETE ACTION TRIGGERED FOR ITEM NO: ' + itemNo);
  }

  addbtn(): void {
    this._router.navigate(['add-item-master'], {relativeTo: this._activatedRoute})
  }
}