import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, CommonModule, CurrencyPipe, DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { pricingIF, propertiesIF, inventoryIF, logisticsIF, purchasingIF } from './add-item-master.types';
import { qbsAnimations } from '@qbs/animations';
// 

// PRICING
const DATA_PRICING: pricingIF[] = [
  { position: 1, uomCode: 'Manual', uomName: 'Manual', basePrice: null, reducedBy: null, price: null, auto: false },
  { position: 2, uomCode: 'KG', uomName: 'KG', basePrice: null, reducedBy: null, price: null, auto: true },
];
// PROPERTIES
const DATA_PROPERTIES: propertiesIF[] = [
  { propertyID: 1, propertyName: 'PROPERTY-ITEM-1' },
  { propertyID: 2, propertyName: 'PROPERTY-ITEM-2' },
];
// INVENTORY
const DATA_INVENTORY: inventoryIF[] = [
  { position: 1, warehouseCode: 'MAPP0001', warehouseName: 'Mobile App', isDefaultWH: true, locked: true, inStock: 99, committed: 19, ordered: 19, available: 90, itemCost: 1000 },
];
// LOGISTICS
const DATA_LOGISTICS: logisticsIF[] = [
  { barcodeID: 1, barcodeText: '', defaultTrue: true, freeText: '' },
];
// PURCHAISNG
const DATA_PURCHASING: purchasingIF[] = [
  { bpID: 1, bpCode: '', bpName: '', defaultTrue: true, priceList: '', itemPrice: '', lastPrice: '' },
];
// 


@Component({
  selector: 'app-add-item-master',
  standalone: true,
  templateUrl: './add-item-master.component.html',
  styleUrl: './add-item-master.component.scss',
  animations: qbsAnimations,
  encapsulation: ViewEncapsulation.None,
  imports: [AsyncPipe, CommonModule, CurrencyPipe, DatePipe, FormsModule, MatButtonModule, MatButtonToggleModule, MatCheckboxModule, MatDatepickerModule, MatDialogModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatOptionModule, MatPaginatorModule, MatProgressBarModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSortModule, MatSlideToggleModule, MatTableModule, MatTabsModule, MatTooltipModule, NgClass, NgTemplateOutlet, QbsCardComponent, QbsFindByKeyPipe, ReactiveFormsModule, RouterLink, RouterOutlet, TextFieldModule],
  providers: [DatePipe],
})
export class AddItemMasterComponent implements OnInit, OnDestroy {
  generalForm: FormGroup;

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

  // PRICING
  displayedColumnsPricing: string[] = ['select', 'uomCode', 'uomName', 'basePrice', 'reducedBy', 'price', 'auto'];
  dataSourcePricing = new MatTableDataSource<pricingIF>(DATA_PRICING);
  selectionPricing = new SelectionModel<pricingIF>(true, []);
  isAllSelectedPricing() {
    const numSelected = this.selectionPricing.selected.length;
    const numRows = this.dataSourcePricing.data.length;
    return numSelected === numRows;
  }

  // PROPERTIES
  displayedColumnsProperties: string[] = ['propertyID', 'propertyName', 'select'];
  dataSourceProperties = new MatTableDataSource<propertiesIF>(DATA_PROPERTIES);
  selectionProperties = new SelectionModel<propertiesIF>(true, []);
  isAllSelectedProperties() {
    const numSelected = this.selectionProperties.selected.length;
    const numRows = this.dataSourceProperties.data.length;
    return numSelected === numRows;
  }

  // LOGISTICS
  displayedColumnsLogistics: string[] = ['select', 'barcodeText', 'default', 'freeText'];
  dataSourceLogistics = new MatTableDataSource<logisticsIF>(DATA_LOGISTICS);
  selectionLogistics = new SelectionModel<logisticsIF>(true, []);
  isAllSelectedLogistics() {
    const numSelected = this.selectionLogistics.selected.length;
    const numRows = this.dataSourceLogistics.data.length;
    return numSelected === numRows;
  }

  // INVENTORY
  displayedColumnsInventory = ['select', 'warehouseCode', 'warehouseName', 'isDefaultWH', 'locked', 'inStock', 'committed', 'ordered', 'available', 'itemCost'];
  dataSourceInventory = new MatTableDataSource<inventoryIF>(DATA_INVENTORY);
  selectionInventory = new SelectionModel<inventoryIF>(true, []);
  isAllSelectedInventory() {
    const numSelected = this.selectionInventory.selected.length;
    const numRows = this.dataSourceInventory.data.length;
    return numSelected === numRows;
  }

  // PURCHASING
  displayedColumnsPurchaisng: string[] = ['select', 'bpCode', 'bpName', 'defaultTrue', 'priceList', 'itemPrice', 'lastPrice'];
  dataSourcePurchaisng = new MatTableDataSource<purchasingIF>(DATA_PURCHASING);
  selectionPurchasing = new SelectionModel<purchasingIF>(true, []);
  isAllSelectedPurchasing() {
    const numSelected = this.selectionPurchasing.selected.length;
    const numRows = this.dataSourcePurchaisng.data.length;
    return numSelected === numRows;
  }

  // SELECTS ALL ROWS IF THEY ARE NOT ALL SELECTED; OTHERWISE CLEAR SELECTION.
  // PRICING
  toggleAllRowsPricing() {
    if (this.isAllSelectedPricing()) {
      this.selectionPricing.clear();
      return;
    }
    this.selectionPricing.select(...this.dataSourcePricing.data);
  }

  // PROPERTIES
  toggleAllRowsProperties() {
    if (this.isAllSelectedProperties()) {
      this.selectionProperties.clear();
      return;
    }
    this.selectionProperties.select(...this.dataSourceProperties.data);
  }

  // LOGISTICS
  toggleAllRowsLogistics() {
    if (this.isAllSelectedLogistics()) {
      this.selectionLogistics.clear();
      return;
    }
    this.selectionLogistics.select(...this.dataSourceLogistics.data);
  }

  // INVENTORY
  toggleAllRowsInventory() {
    if (this.isAllSelectedInventory()) {
      this.selectionInventory.clear();
      return;
    }
    this.selectionInventory.select(...this.dataSourceInventory.data);
  }

  // PURCHASING
  toggleAllRowsPurchasing() {
    if (this.isAllSelectedPurchasing()) {
      this.selectionPurchasing.clear();
      return;
    }
    this.selectionPurchasing.select(...this.dataSourcePurchaisng.data);
  }

  // THE LABEL FOR THE CHECKBOX ON THE PASSED ROW
  // PRICING
  checkboxLabel(row?: pricingIF): string {
    if (!row) {
      return `${this.isAllSelectedPricing() ? 'deselect' : 'select'} all`;
    }
    return `${this.selectionPricing.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  // PROPERTIES
  checkboxLabelProperties(row?: propertiesIF): string {
    if (!row) {
      return `${this.isAllSelectedProperties() ? 'deselect' : 'select'} all`;
    }
    return `${this.selectionProperties.isSelected(row) ? 'deselect' : 'select'} row ${row.propertyID + 1}`;
  }


  //Roles Dropdown

  booleanOptions = [
    { label: 'Yes', value: 1 },
    { label: 'No', value: 0 }
  ]
  selectedBoolean: number = 0;
  selectedBooleanTrue: number = 1;

  isActive: number = 1;
  isInactive: number = 0;
  // isActive: boolean = false;
  // isInactive: boolean = false;


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
  // itemId: number;
  itemId: number = 1;

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
  regionId: number;

  // LOGISTICS
  // barcodeManageItemsList: string[] = ['None', 'Serial Numbers', 'Batches'];
  barcodeManageItemsList = [
    { id: 1, label: 'None', value: 'None' },
    { id: 2, label: 'Serial Numbers', value: 'Serial Numbers' },
    { id: 3, label: 'Batches', value: 'Batches' },
  ];
  selectedbarcodeManageItem: string = 'None';

  managementMethodList = [
    { id: 1, label: 'On Every Transaction', value: 'On Every Transaction' },
    { id: 2, label: 'On Release Only', value: 'On Release Only' },
  ];
  selectedManagementMethod: string = 'On Every Transaction';

  issuePrimarilyByList = [
    { id: 1, label: 'Issue Primarily by Serial/Batch Number', value: 'Issue Primarily by Serial/Batch Number' },
    { id: 2, label: 'Issue Primarily by Bin Location', value: 'Issue Primarily by Bin Location' },
  ];
  selectedIssuePrimarilyBy: string = 'Issue Primarily by Serial/Batch Number';

  // TAX - PURCHASING TAX
  customsGroupList: string[] = ['Customs Exampt'];
  selectedCustomsGroup: string = 'Customs Exampt';

  // TAX GROUP
  taxGroupList: string[] = ['IT01', 'IT02'];
  selectedTaxGroup: string = 'IT02';
  selectedSalesTaxGroupX: string = 'IT01';
  salesTaxValue: number = 0.00;

  valuesListSalesPurchase: string[] = ['mm', 'cm', 'dm', 'm', '"', "'", 'Define New'];
  selectedSalesValue: string = 'mm';
  selectedPurchaseValue: string = 'mm';

  volumeValuesList: string[] = ['cmm', 'cc', 'cdm', 'cm', 'ci', "cf"];
  selectedSalesVolume: string = 'cc';
  selectedPurchaseVolume: string = 'cm';


  // INVENTORY
  valuationMethodList = [
    { valuationId: 1, label: 'Moving Average', value: 'Moving Average' },
    { valuationId: 2, label: 'Standard', value: 'Standard' },
    { valuationId: 3, label: 'FIFO', value: 'FIFO' },
  ];
  valuationValue: string = 'Moving Average';  // Default value
  itemCurrency: string = "PKR";
  itemCost: number = 0.00;

  // PRICING
  pricingList: string[] = ['PRICING-LIST-01', 'PRICING-LIST-02', 'PRICING-LIST-03', 'PRICING-LIST-04'];
  selectedPricing: string = 'PRICING-LIST-01';

  brandsList: string[] = ['BRAND-A', 'BRAND-B', 'BRAND-C', 'BRAND-D'];
  selectedBrand: string = 'BRAND-B';

  departmentsList: string[] = ['DEPTARTMENT-A', 'DEPTARTMENT-B', 'DEPTARTMENT-C', 'DEPTARTMENT-D'];
  selectedDepartment: string = 'DEPTARTMENT-D';

  materialsList: string[] = ['MATERIAL-A', 'MATERIAL-B', 'MATERIAL-C', 'MATERIAL-D'];
  selectedMaterial: string = 'MATERIAL-A';

  modelslineList: string[] = ['MODEL-LINE-A', 'MODEL-LINE-B', 'MODEL-LINE-C', 'MODEL-LINE-D'];
  selectedLine: string = 'MODEL-LINE-C';
  // 
  constructor(private dialog: MatDialog) {
  }
  ngOnInit(): void {
    this.generalForm = new FormGroup({
      // GENERAL - BASIC INFORMATION
      seriesid: new FormControl(''),
      itemNo: new FormControl('ITM00087'),
      description: new FormControl(''),
      foreignName: new FormControl(''),
      itemGroupid: new FormControl(''),
      uOMGroupId: new FormControl(''),
      // GENERAL - ITEM TYPE
      itemId: new FormControl(this.itemId),
      isInventoryItem: new FormControl(this.selectedBooleanTrue),
      isSalesItem: new FormControl(''),
      isPurchasingItem: new FormControl(this.selectedBooleanTrue),
      // GENERAL - PREFERENCES
      manufacturerId: new FormControl(''),
      shippingType: new FormControl(''),
      advanceRuleTypeId: new FormControl(''),
      regionId: new FormControl(''),
      isActive: new FormControl(false),
      isActiveFromDate: new FormControl(null),
      isActiveToDate: new FormControl(null),
      isActiveRemarks: new FormControl(null),
      isInactive: new FormControl(false),
      isInactiveFromDate: new FormControl(null),
      isInactiveToDate: new FormControl(null),
      isInactiveRemarks: new FormControl(null),
      // ADDITIONAL INFORMATION
      images: new FormControl(null),
      // GENERAL - ITEMS CLASSIFICATION
      standardItemIdentificationId: new FormControl(''),
      commodityClassificationId: new FormControl(''),
      // LOGISTICS - WARRANTY TEMPLATE
      templateId: new FormControl(''),
      // INVENTORY - PURCHASE TAX GROUP
      selectedPurchTGCode: new FormControl(''),
      selectedSalesTGCode: new FormControl(''),
    });
    this.generalForm.get('itemId')?.valueChanges.subscribe((value: number) => {
      this.updateItemControls(value);
    });
    this.updateItemControls(this.itemId);
  }
  // 
  ngOnDestroy(): void { }
  // 
  viewModeClass: string = ''
  // UPDATE THE isInventoryItem & isPurchasingItem BASED ON THE SELECTED itemId
  updateItemControls(itemId: number) {
    if (itemId !== 1) {
      this.generalForm.get('isInventoryItem')?.setValue(0);
      this.generalForm.get('isPurchasingItem')?.setValue(0);
      this.viewModeClass = 'view-mode';
    } else {
      this.generalForm.get('isInventoryItem')?.setValue(1);
      this.generalForm.get('isPurchasingItem')?.setValue(1);
      this.viewModeClass = '';
    }
  }

  // ng-templates
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
      // this.uOMGroupId = selectedRow.group;
      this.generalForm.get('uOMGroupId').setValue(selectedRow.uOMGroupId);    // UPDATE THE FORM CONTROL VALUE FOR uOMGroupId
      this.uOMGroupId = selectedRow.uOMGroupId;  // OPTIONALLY, UPDATE THE LOCAL VARIABLE (IF NEEDED)
      this.uOMGroupId = selectedRow.uOMGroupId; // uOMGroupId FOR VALUE
      this.uOMGroupTitle = selectedRow.group;      // group FOR UI DISPLAY
      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // UOM GROUP NG TEMPLATE DIALOG STARTS


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
      // this.standardItemIdentificationId = selectedRow.code;
      this.generalForm.get('standardItemIdentificationId').setValue(selectedRow.StandardItemId);  // UPDATE THE FORM CONTROL VALUE
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

  // selectedCommodityClass: number = 1;
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
      // this.selectedCommodityClass = selectedRow.code;
      this.generalForm.get('commodityClassificationId').setValue(selectedRow.commodityClassificationId);  // UPDATE THE FORM CONTROL VALUE
      this.commodityClassificationId = selectedRow.commodityClassificationId; // OPTIONALLY, UPDATE THE LOCAL VARIABLE (IF NEEDED)
      this.commodityClassificationId = selectedRow.commodityClassificationId;  // commodityClassificationId FOR VALUE
      this.commodityClassificationDescription = selectedRow.description;      // description FOR UI DISPLAY
      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // COMMODITY CLASSIFICATION NG TEMPLATE DIALOG ENDS


  // LOGISTICS
  // WARRANTY TEMPLATE NG TEMPLATE DIALOG STARTS
  @ViewChild('dialogTemplateWarrantyTemplate') dialogTemplateWarrantyTemplate;
  onWarrantyTemplateClick(): void {
    const dialogRef = this.dialog.open(this.dialogTemplateWarrantyTemplate, {
      width: '85%',
      height: '75vh',
      data: this.dataSourceWarrantyTemplate,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }
  // DATA FOR WARRANTY TEMPLATE NG TEMPLATE DIALOG (MatTable)
  displayedColumnsWarrantyTemplate: string[] = ['select', 'templateName', 'contactType'];
  dataSourceWarrantyTemplate = [
    { templateId: 1, templateName: 'ABC-XYZ', contactType: 'Serial Numbers', isSelected: false },
    { templateId: 2, templateName: 'QWERTY', contactType: 'Serial Numbers', isSelected: false },
  ];

  templateId: number;
  selectedTemplateName: string = '';
  selectedContactType: string = '';

  onCheckboxChangeWarrantyTemplate(selectedRow: any): void {
    this.dataSourceWarrantyTemplate.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  addSelectedRowWarrantyTemplate(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceWarrantyTemplate.find(row => row.isSelected);
    if (selectedRow) {
      // this.selectedCommodityClass = selectedRow.code;
      this.generalForm.get('templateId').setValue(selectedRow.templateId);  // UPDATE THE FORM CONTROL VALUE
      this.templateId = selectedRow.templateId; // OPTIONALLY, UPDATE THE LOCAL VARIABLE (IF NEEDED)
      this.templateId = selectedRow.templateId;  // templateId FOR VALUE
      this.selectedTemplateName = selectedRow.templateName;      // templateName FOR UI DISPLAY
      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // WARRANTY TEMPLATE NG TEMPLATE DIALOG ENDS

  // TAX
  // PURCHASING TAX GROUP NG TEMPLATE DIALOG STARTS
  @ViewChild('dialogTemplatePurchTaxGroup') dialogTemplatePurchTaxGroup;
  onPurchTaxGroupClick(): void {
    const dialogRef = this.dialog.open(this.dialogTemplatePurchTaxGroup, {
      width: '85%',
      height: '75vh',
      data: this.dataSourcePurchTaxGroup,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }
  // DATA FOR PURCHASING TAX GROUP NG TEMPLATE DIALOG (MatTable)
  displayedColumnsPurchTaxGroup: string[] = ['select', 'code', 'name', 'percent', 'eu'];
  dataSourcePurchTaxGroup = [
    { id: 1, taxGroupCode: 'ITO1', taxGroupName: 'Goods at zero-rate', percent: 0.00, eu: false, isSelected: false },
    { id: 2, taxGroupCode: 'ITO2', taxGroupName: 'Goods at standart rate Registered (default)', percent: 17.00, eu: false, isSelected: false },
    { id: 3, taxGroupCode: 'ITO3', taxGroupName: 'Goods at standart rate Un-Registered', percent: 20.00, eu: false, isSelected: false },
    { id: 4, taxGroupCode: 'ITO4', taxGroupName: 'Services', percent: 13.00, eu: false, isSelected: false },
    { id: 5, taxGroupCode: 'P1', taxGroupName: 'AU Purchase - GST Liable', percent: 10.00, eu: false, isSelected: false },
  ];

  // selectedPurchTaxGroup: string = '';
  selectedPurchTGCode: string = '';
  selectedPurchTGDescription: string = '';
  selectedPurchTGPercent: number;

  onCheckboxChangePurchTaxGroup(selectedRow: any): void {
    this.dataSourcePurchTaxGroup.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  addSelectedRowPurchTaxGroup(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourcePurchTaxGroup.find(row => row.isSelected);
    if (selectedRow) {
      this.selectedPurchTGCode = selectedRow.taxGroupCode;
      this.generalForm.get('selectedPurchTGCode').setValue(selectedRow.taxGroupCode);  // UPDATE THE FORM CONTROL VALUE
      this.selectedPurchTGCode = selectedRow.taxGroupCode;                            // OPTIONALLY, UPDATE THE LOCAL VARIABLE (IF NEEDED)
      this.selectedPurchTGCode = selectedRow.taxGroupCode;                           // taxGroupCode FOR VALUE
      this.selectedPurchTGDescription = selectedRow.taxGroupName;                   // taxGroupName FOR UI DISPLAY
      this.selectedPurchTGPercent = selectedRow.percent;
      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // PURCHASING TAX GROUP NG TEMPLATE DIALOG ENDS

  // SALES TAX GROUP NG TEMPLATE DIALOG STARTS
  @ViewChild('dialogTemplateSalesTaxGroup') dialogTemplateSalesTaxGroup;
  onSalesTaxGroupClick(): void {
    const dialogRef = this.dialog.open(this.dialogTemplateSalesTaxGroup, {
      width: '85%',
      height: '75vh',
      data: this.dataSourceSalesTaxGroup,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }
  // DATA FOR SALES TAX GROUP NG TEMPLATE DIALOG (MatTable)
  displayedColumnsSalesTaxGroup: string[] = ['select', 'code', 'name', 'percent', 'eu'];
  dataSourceSalesTaxGroup = [
    { id: 1, taxGroupCode: 'ITO1', taxGroupName: 'Goods at zero-rate', percent: 0.00, eu: false, isSelected: false },
    { id: 2, taxGroupCode: 'ITO2', taxGroupName: 'Goods at standart rate Registered (default)', percent: 17.00, eu: false, isSelected: false },
    { id: 3, taxGroupCode: 'ITO3', taxGroupName: 'Goods at standart rate Un-Registered', percent: 20.00, eu: false, isSelected: false },
  ];

  // selectedSalesTaxGroup: string = '';
  selectedSalesTGCode: string = '';
  selectedSalesTGDescription: string = '';
  selectedSalesTGPercent: number;

  onCheckboxChangeSalesTaxGroup(selectedRow: any): void {
    this.dataSourceSalesTaxGroup.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  addSelectedRowSalesTaxGroup(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceSalesTaxGroup.find(row => row.isSelected);
    if (selectedRow) {
      this.selectedSalesTGCode = selectedRow.taxGroupCode;
      this.generalForm.get('selectedSalesTGCode').setValue(selectedRow.taxGroupCode);  // UPDATE THE FORM CONTROL VALUE
      this.selectedSalesTGCode = selectedRow.taxGroupCode;                            // OPTIONALLY, UPDATE THE LOCAL VARIABLE (IF NEEDED)
      this.selectedSalesTGCode = selectedRow.taxGroupCode;                           // taxGroupCode FOR VALUE
      this.selectedSalesTGDescription = selectedRow.taxGroupName;                   // taxGroupName FOR UI DISPLAY
      this.selectedSalesTGPercent = selectedRow.percent;
      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // SALES TAX GROUP NG TEMPLATE DIALOG ENDS

  // INVENTORY WAREHOUSE CODE NG TEMPLATE DIALOG STARTS
  @ViewChild('dialogTemplateWarehouseCode') dialogTemplateWarehouseCode;
  onInventoryWarehouseClick(): void {
    const dialogRef = this.dialog.open(this.dialogTemplateWarehouseCode, {
      width: '85%',
      height: '75vh',
      data: this.dataSourceWarehouseCode,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('DIALOG CLOSED');
    });
  }
  // DATA FOR PURCHASING TAX GROUP NG TEMPLATE DIALOG (MatTable)
  displayedColumnsWarehouseCode: string[] = ['select', 'warehouseCode', 'warehouseName', 'location'];
  dataSourceWarehouseCode = [
    { id: 1, warehouseCode: 'WHDLT002', warehouseName: 'Dalda Tin ZCL Electrical Items', location: 'Dalda', isSelected: false },
  ];
  selectedWarehouseCode: string = '';
  onCheckboxChangeWarehouseCode(selectedRow: any): void {
    this.dataSourceWarehouseCode.forEach(row => (row.isSelected = false));
    selectedRow.isSelected = true;
  }
  addSelectedRowWarehouseCode(): void {
    this.dialog.closeAll();
    const selectedRow = this.dataSourceWarehouseCode.find(row => row.isSelected);
    if (selectedRow) {
      this.selectedWarehouseCode = selectedRow.warehouseCode;
      console.log('Selected Row:', selectedRow);
    } else {
      console.log('No row selected');
    }
  }
  // INVENTORY WAREHOUSE CODE NG TEMPLATE DIALOG ENDS

  closeDialog(): void {
    this.dialog.closeAll();
  }

  submitForm(): void {
    if (this.generalForm.valid) {
      // GET THE FORM VALUES
      const formValues = this.generalForm.value;
      // CREATING PAYLOAD INCLUDING THE FORM FIELDS AND THE IMAGES
      const payload = {
        ...formValues,
        images: this.selectedImages.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      };
      // console.log(this.generalForm.value);
      console.log('FORM SUBMISSION PAYLOAD:', payload);
      // Example: Send payload to an API or service
      // this.someService.submitData(payload).subscribe(response => {
      //     console.log('Submission Successful:', response);
      // });
      // RESETTING FORM FIELDS
      this.generalForm.reset();
      this.selectedImages = [];
    } else {
      console.log('Form is invalid!');
    }
  }


  // IMAGE UPLOAD
  selectedImages: File[] = [];
  // Handle image selection (when the "Camera Icon" is clicked)
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      this.selectedImages.push(...Array.from(input.files));
    }
  }
  // Handle image drop (drag-and-drop)
  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.selectedImages.push(...Array.from(files));
    }
  }
  // Handle drag over event (optional styling or feedback)
  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    // Optionally change the appearance during drag over
  }
  // Handle drag leave event (optional reset)
  onImageDragLeave(event: DragEvent): void {
    // Optionally reset the appearance when dragging leaves
  }
  // Remove image from the selected images array
  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }
}
