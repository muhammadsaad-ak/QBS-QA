import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, CurrencyPipe, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterOutlet } from '@angular/router';
import { QbsCardComponent } from '@qbs/components/card';
import { QbsFindByKeyPipe } from '@qbs/pipes/find-by-key';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { qbsAnimations } from '@qbs/animations';

@Component({
  selector: 'app-edit-item-master',
  standalone: true,
  templateUrl: './edit-item-master.component.html',
  styleUrl: './edit-item-master.component.scss',
  animations: qbsAnimations,
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe],
  imports: [AsyncPipe, CommonModule, CurrencyPipe, DatePipe, FormsModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSortModule, MatSlideToggleModule, MatTableModule, MatTabsModule, MatTooltipModule, NgClass, NgTemplateOutlet, QbsCardComponent, QbsFindByKeyPipe, ReactiveFormsModule, RouterLink, RouterOutlet, TextFieldModule],
})
export class EditItemMasterComponent implements OnInit, OnDestroy {

  generalForm: FormGroup;
  generalFormUpdate: FormGroup;
  isDropdownDisabled: boolean = true;
  editMode: boolean = false;
  // 
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.generalForm = new FormGroup({
      // GENERAL - BASIC INFORMATION
      seriesid: new FormControl(null),
      itemNo: new FormControl(''),
      description: new FormControl(''),
      foreignName: new FormControl(''),
      itemGroupid: new FormControl(null),
      uOMGroupId: new FormControl(''),
      // GENERAL - ITEM TYPE
      itemId: new FormControl(''),
      isInventoryItem: new FormControl(''),
      isSalesItem: new FormControl(''),
      isPurchasingItem: new FormControl(''),
      // GENERAL - PREFERENCES
      manufacturerId: new FormControl(''),
      shippingType: new FormControl(''),
      advanceRuleTypeId: new FormControl(''),
      regionId: new FormControl(''),
      isActive: new FormControl(false),
      isActiveFromDate: new FormControl(''),
      isActiveToDate: new FormControl(''),
      isActiveRemarks: new FormControl(''),
      isInactive: new FormControl(false),
      isInactiveFromDate: new FormControl(''),
      isInactiveToDate: new FormControl(''),
      isInactiveRemarks: new FormControl(''),
      // GENERAL - ITEMS CLASSIFICATION
      standardItemIdentificationId: new FormControl(''),
      commodityClassificationId: new FormControl(''),
    });
    this.generalFormUpdate = new FormGroup({
      // GENERAL - BASIC INFORMATION
      seriesid: new FormControl(null),
      itemNo: new FormControl(''),
      description: new FormControl(''),
      foreignName: new FormControl(''),
      itemGroupid: new FormControl(null),
      uOMGroupId: new FormControl(''),
      // GENERAL - ITEM TYPE
      itemId: new FormControl(''),
      isInventoryItem: new FormControl(''),
      isSalesItem: new FormControl(''),
      isPurchasingItem: new FormControl(''),
      // GENERAL - PREFERENCES
      manufacturerId: new FormControl(''),
      shippingType: new FormControl(''),
      advanceRuleTypeId: new FormControl(''),
      regionId: new FormControl(''),
      isActive: new FormControl(false),
      isActiveFromDate: new FormControl(''),
      isActiveToDate: new FormControl(''),
      isActiveRemarks: new FormControl(''),
      isInactive: new FormControl(false),
      isInactiveFromDate: new FormControl(''),
      isInactiveToDate: new FormControl(''),
      isInactiveRemarks: new FormControl(''),
      // GENERAL - ITEMS CLASSIFICATION
      standardItemIdentificationId: new FormControl(''),
      commodityClassificationId: new FormControl(''),
    });
  }
  // 
  ngOnInit(): void {
    const navigationData = history.state.data; // ACCESS THE DATA FROM NAVIGATION STATE
    if (navigationData) {
      this.populateFormWithItemMasterData(navigationData);
    }
    //   this.route.queryParams.subscribe((params) => {
    //     if (params['itemData']) {
    //       const data = JSON.parse(params['itemData']);
    //       this.populateFormWithItemMasterData(data);
    //     }
    //   });
  }
  // 
  ngOnDestroy(): void { }
  // 
  populateFormWithItemMasterData(data: any): void {
    if (data) {
      this.generalForm.patchValue({
        // GENERAL - BASIC INFORMATION
        itemNo: data.itemNo,
        seriesid: data.seriesid,
        description: data.description,
        foreignName: data.foreignName,
        itemGroupid: data.itemGroupid,
        uOMGroupId: data.uOMGroupId,
        // GENERAL - ITEM TYPE
        itemId: data.itemId,
        isInventoryItem: data.isInventoryItem,
        isSalesItem: data.isSalesItem,
        isPurchasingItem: data.isPurchasingItem,
        // GENERAL - PREFERENCES
        manufacturerId: data.manufacturerId,
        shippingType: data.shippingType,
        advanceRuleTypeId: data.advanceRuleTypeId,
        regionId: data.regionId,
        isActive: data.isActive === true,
        isActiveFromDate: data.isActiveFromDate ? new Date(data.isActiveFromDate) : null,
        isActiveToDate: data.isActiveToDate ? new Date(data.isActiveToDate) : null,
        isActiveRemarks: data.isActiveRemarks,
        isInactive: data.isInactive === true,
        isInactiveFromDate: data.isInactiveFromDate ? new Date(data.isInactiveFromDate) : null,
        isInactiveToDate: data.isInactiveToDate ? new Date(data.isInactiveToDate) : null,
        isInactiveRemarks: data.isInactiveRemarks,
        // GENERAL - ITEMS CLASSIFICATION
        standardItemIdentificationId: data.standardItemIdentificationId,
        commodityClassificationId: data.commodityClassificationId
      });
      // UPDATE FORM
      this.generalFormUpdate.patchValue({
        // GENERAL - BASIC INFORMATION
        itemNo: data.itemNo,
        seriesid: data.seriesid,
        description: data.description,
        foreignName: data.foreignName,
        itemGroupid: data.itemGroupid,
        uOMGroupId: data.uOMGroupId,
        // GENERAL - ITEM TYPE
        itemId: data.itemId,
        isInventoryItem: data.isInventoryItem,
        isSalesItem: data.isSalesItem,
        isPurchasingItem: data.isPurchasingItem,
        // GENERAL - PREFERENCES
        manufacturerId: data.manufacturerId,
        shippingType: data.shippingType,
        advanceRuleTypeId: data.advanceRuleTypeId,
        regionId: data.regionId,
        isActive: data.isActive === true,
        isActiveFromDate: data.isActiveFromDate ? new Date(data.isActiveFromDate) : null,
        isActiveToDate: data.isActiveToDate ? new Date(data.isActiveToDate) : null,
        isActiveRemarks: data.isActiveRemarks,
        isInactive: data.isInactive === true,
        isInactiveFromDate: data.isInactiveFromDate ? new Date(data.isInactiveFromDate) : null,
        isInactiveToDate: data.isInactiveToDate ? new Date(data.isInactiveToDate) : null,
        isInactiveRemarks: data.isInactiveRemarks,
        // GENERAL - ITEMS CLASSIFICATION
        standardItemIdentificationId: data.standardItemIdentificationId,
        commodityClassificationId: data.commodityClassificationId
      });
    }
  }
  // 
  // ViewChild to access DOM elements for Customers and Vendors sections
  @ViewChild('generalSection') generalSection!: ElementRef;
  @ViewChild('logisticsSection') logisticsSection!: ElementRef;
  @ViewChild('purchasingSection') purchasingSection!: ElementRef;
  @ViewChild('salesSection') salesSection!: ElementRef;
  @ViewChild('taxSection') taxSection!: ElementRef;
  @ViewChild('inventorySection') inventorySection!: ElementRef;
  @ViewChild('pricingSection') pricingSection!: ElementRef;
  @ViewChild('propertiesSection') propertiesSection!: ElementRef;
  @ViewChild('userDefinedFieldsSection') userDefinedFieldsSection!: ElementRef;

  activeTab = 'general';

  scrollToSection(section: 'general' | 'logistics' | 'purchasing' | 'sales' | 'tax' | 'inventory' | 'pricing' | 'properties' | 'user-defined-fields') {
    let element;

    switch (section) {
      case 'general':
        element = this.generalSection;
        break;
      case 'logistics':
        element = this.logisticsSection;
        break;
      case 'purchasing':
        element = this.purchasingSection;
        break;
      case 'sales':
        element = this.salesSection;
        break;
      case 'tax':
        element = this.taxSection;
        break;
      case 'inventory':
        element = this.inventorySection;
        break;
      case 'pricing':
        element = this.pricingSection;
        break;
      case 'properties':
        element = this.propertiesSection;
        break;
      case 'user-defined-fields':
        element = this.userDefinedFieldsSection;
        break;
      default:
        break;
    }

    if (element) {
      (element as any).nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // GENERAL - BASIC INFORMATION

  // seriesList: string[] = ['ITEM', 'ITEM-2', ''ITEM-3'];
  // seriesid: string = 'ITEM';

  seriesList = [
    { seriesid: 1, label: 'ITEM', value: 'ITEM' },
  ];
  seriesid: number;

  itemGroupList = [
    { itemGroupid: 1, label: 'Items', value: 'Items' },
  ];
  itemGroupid: number;

  // GENERAL - ITEM TYPE
  itemTypesList = [
    { itemId: 1, label: 'Items', value: 'Items' },
    { itemId: 2, label: 'Labour', value: 'Labour' },
    { itemId: 3, label: 'Travel', value: 'Travel' },
  ];
  itemId: number;

  // GENERAL - PREFERENCES
  manufacturersList = [
    { manufacturerId: 1, label: 'Manufacturer', value: 'Manufacturer' },
  ];
  manufacturerId: number;

  shippingTypeList = [
    { shippingTypeId: 1, label: 'By Road', value: 'By Road' },
    { shippingTypeId: 2, label: 'By Sea', value: 'By Sea' },
    { shippingTypeId: 3, label: 'Shipping Type', value: 'Shipping Type' },
  ];
  shippingType: number;

  advanceRuleTypeList = [
    { advanceRuleTypeId: 1, label: 'General', value: 'General' },
    { advanceRuleTypeId: 2, label: 'Warehouse', value: 'Warehouse' },
    { advanceRuleTypeId: 3, label: 'Item Group', value: 'Item Group' },
  ];
  advanceRuleTypeId: number;

  regionsList = [
    { regionId: 1, label: 'Pakistan', value: 'Pakistan' },
    { regionId: 2, label: 'KSA', value: 'KSA' },
  ];
  regionId: string = '';


  booleanOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ]

  selectedBoolean: boolean = false;
  selectedBooleanTrue: boolean = true;

  isActive: boolean = true;
  isInactive: boolean = false;

  // UOM GROUP NG TEMPLATE DIALOG STARTS
  @ViewChild('dialogTemplateUoMGroup') dialogTemplateUoMGroup;
  onUoMGroupClick(): void {
    const dialogRef = this.dialog.open(this.dialogTemplateUoMGroup, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceUoMGroup,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }
  // DATA FOR UOM GROUP NG TEMPLATE DIALOG (MatTable)
  displayedColumnsUoMGroup: string[] = ['select', 'group', 'groupDescription'];
  dataSourceUoMGroup = [
    { uOMGroupId: 1, group: 'Manual', groupDescription: 'Manual', isSelected: false },
    { uOMGroupId: 2, group: 'KG', groupDescription: 'KG', isSelected: false },
  ];

  uOMGroupId: number;
  uOMGroupTitle: string;

  onCheckboxChangeUoMGroup(selectedRow: any): void {
    this.dataSourceUoMGroup.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  addSelectedRowUoMGroup(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceUoMGroup.find(row => row.isSelected);
    if (selectedRow) {
      this.generalFormUpdate.get('uOMGroupId').setValue(selectedRow.uOMGroupId); // UPDATE THE FORM CONTROL VALUE FOR uOMGroupId
      this.uOMGroupId = selectedRow.uOMGroupId; // OPTIONALLY, UPDATE THE LOCAL VARIABLE (IF NEEDED)

      this.uOMGroupId = selectedRow.uOMGroupId; // uOMGroupId FOR VALUE
      this.uOMGroupTitle = selectedRow.group;      // group FOR UI DISPLAY
      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // DATA FOR UOM GROUP NG TEMPLATE DIALOG (MatTable) ENDS

  // STANDARD ITEM NG TEMPLATE DIALOG STARTS
  @ViewChild('dialogTemplateStandardItem') dialogTemplateStandardItem;
  onStandardItemIDClick(): void {
    const dialogRef = this.dialog.open(this.dialogTemplateStandardItem, {
      width: '75%',
      height: '75vh',
      data: this.dataSourceStandardItem,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }
  // DATA FOR STANDARD ITEM NG TEMPLATE DIALOG (MatTable)
  displayedColumnsStandardItem: string[] = ['select', 'codeList', 'code', 'description', 'schemaCode', 'shemaDescription'];
  dataSourceStandardItem = [
    { StandardItemId: 1, id: 1, codeList: 'Auto', code: 'STD-ITEM-00001', description: 'STANDARD', schemaCode: 'SCH-ITEM-00001', shemaDescription: 'STANDARD SCHEMA', isSelected: false },
  ];
  standardItemIdentificationId: number;
  standardItemDescription: string = '';
  onCheckboxChangeStandardItem(selectedRow: any): void {
    this.dataSourceStandardItem.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  addSelectedRowStandardItem(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceStandardItem.find(row => row.isSelected);
    if (selectedRow) {
      this.generalFormUpdate.get('standardItemIdentificationId').setValue(selectedRow.StandardItemId);  // UPDATE THE FORM CONTROL VALUE
      this.standardItemIdentificationId = selectedRow.StandardItemId; // OPTIONALLY, UPDATE THE LOCAL VARIABLE (IF NEEDED)

      this.standardItemIdentificationId = selectedRow.StandardItemId; // StandardItemId FOR VALUE
      this.standardItemDescription = selectedRow.description;      // description FOR UI DISPLAY

      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // STANDARD ITEM NG TEMPLATE DIALOG ENDS

  // COMMODITY CLASSIFICATION NG TEMPLATE DIALOG STARTS
  @ViewChild('dialogTemplateCommodityClass') dialogTemplateCommodityClass;
  onCommodityClassClick(): void {
    const dialogRef = this.dialog.open(this.dialogTemplateCommodityClass, {
      width: '85%',
      height: '75vh',
      data: this.dataSourceCommodityClass,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }
  // DATA FOR COMMODITY CLASSIFICATION NG TEMPLATE DIALOG (MatTable)
  displayedColumnsCommodityClass: string[] = ['select', 'codeList', 'code', 'description', 'schemaCode', 'shemaDescription'];
  dataSourceCommodityClass = [
    { commodityClassificationId: 1, codeList: 'Auto', code: 'Commodity-00001', description: 'COMMODITY', schemaCode: 'COMMODITY-SCH-001', shemaDescription: 'COMMODITY SCHEMA', isSelected: false },
    { commodityClassificationId: 2, codeList: 'Auto', code: 'Commodity-00002', description: 'COMMODITY-2', schemaCode: 'COMMODITY-SCH-002', shemaDescription: 'COMMODITY SCHEMA-2', isSelected: false },
  ];

  commodityClassificationId: number;
  commodityClassificationDescription: string = '';

  onCheckboxChangeCommodityClass(selectedRow: any): void {
    this.dataSourceCommodityClass.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  addSelectedRowCommodityClass(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceCommodityClass.find(row => row.isSelected);
    if (selectedRow) {
      this.generalFormUpdate.get('commodityClassificationId').setValue(selectedRow.commodityClassificationId);  // UPDATE THE FORM CONTROL VALUE
      this.commodityClassificationId = selectedRow.commodityClassificationId; // OPTIONALLY, UPDATE THE LOCAL VARIABLE (IF NEEDED)

      this.commodityClassificationId = selectedRow.commodityClassificationId;  // commodityClassificationId FOR VALUE
      this.commodityClassificationDescription = selectedRow.description;      // description FOR UI DISPLAY
      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // COMMODITY CLASSIFICATION NG TEMPLATE DIALOG ENDS

  closeDialog(): void {
    this.dialog.closeAll(); // Close the dialog
  }

  updateForm(): void {
    console.log(this.generalFormUpdate.value);
    return;
  }

  // TOGGLE EDIT MODE
  //  @param editMode
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
