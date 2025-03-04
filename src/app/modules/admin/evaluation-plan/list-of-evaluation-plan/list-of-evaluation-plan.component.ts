import { Component } from '@angular/core';
import { AsyncPipe, CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormControl  } from '@angular/forms';
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
import { ItemSamplesService } from 'app/core/other-core-services/module/item-sample.service';

@Component({
  selector: 'app-list-of-evaluation-plan',
  standalone: true,
  templateUrl: './list-of-evaluation-plan.component.html',
  styleUrl: './list-of-evaluation-plan.component.scss',
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
export class ListOfEvaluationPlanComponent implements OnInit, OnDestroy {

  configForm: UntypedFormGroup;
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  orderTypeControl = new FormControl('purchaseOrder');
  currentView = 'evaluationPlan'; // Options: 'evaluationPlan' or 'sapDocuments'

  pageTitle = 'List of Evaluation Plan';
  addUserBtn = "Add Qualitative";
  addBtnTitle = "Add";

  @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;
  drawerMode: 'side' | 'over' = 'side';

  List_Of_Inspection_Data = [];

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  // Static data for Evaluation Plan - Purchase Orders
  evalPlanPurchaseOrderData = [
    {
      docNo: 'PO-001',
      docDate: '2025-02-10',
      lineNo: '1',
      itemCode: 'ITM-1001',
      itemDescription: 'Steel Plate 10mm',
      qty: 50,
      status: 'Pass'
    },
    {
      docNo: 'PO-001',
      docDate: '2025-02-10',
      lineNo: '2',
      itemCode: 'ITM-1002',
      itemDescription: 'Aluminum Sheet 5mm',
      qty: 100,
      status: 'Fail'
    },
    {
      docNo: 'PO-002',
      docDate: '2025-02-15',
      lineNo: '1',
      itemCode: 'ITM-2001',
      itemDescription: 'Copper Wire 2mm',
      qty: 200,
      status: 'In Progress'
    },
    {
      docNo: 'PO-003',
      docDate: '2025-02-18',
      lineNo: '1',
      itemCode: 'ITM-3001',
      itemDescription: 'Plastic Resin Type A',
      qty: 500,
      status: 'Pass'
    },
    {
      docNo: 'PO-004',
      docDate: '2025-02-20',
      lineNo: '1',
      itemCode: 'ITM-4001',
      itemDescription: 'Electronic Component X-42',
      qty: 1000,
      status: 'Pass'
    }
  ];

  // Static data for Evaluation Plan - Production Orders
  evalPlanProductionOrderData = [
    {
      docNo: 'PRO-001',
      docDate: '2025-02-12',
      itemCode: 'PROD-101',
      productName: 'Metal Frame Assembly',
      qty: 25,
      status: 'Fail'
    },
    {
      docNo: 'PRO-002',
      docDate: '2025-02-14',
      itemCode: 'PROD-102',
      productName: 'Circuit Board v2',
      qty: 100,
      status: 'Fail'
    },
    {
      docNo: 'PRO-003',
      docDate: '2025-02-19',
      itemCode: 'PROD-103',
      productName: 'Plastic Housing Type B',
      qty: 50,
      status: 'Pass'
    },
    {
      docNo: 'PRO-004',
      docDate: '2025-02-22',
      itemCode: 'PROD-104',
      productName: 'Final Product Assembly',
      qty: 30,
      status: 'Pass'
    },
    {
      docNo: 'PRO-005',
      docDate: '2025-02-24',
      itemCode: 'PROD-105',
      productName: 'Custom Component Z-99',
      qty: 150,
      status: 'In Progress'
    }
  ];

  // Static data for SAP Documents - Purchase Orders
  sapDocPurchaseOrderData = [
    {
      docNo: 'PO-101',
      lineNo: '1',
      itemCode: 'SAP-1001',
      itemDescription: 'SAP Connector Module',
      qty: 30,
      openQty: 10,
      status: 'Open'
    },
    {
      docNo: 'PO-102',
      lineNo: '1',
      itemCode: 'SAP-1002',
      itemDescription: 'Database Integration Kit',
      qty: 20,
      openQty: 20,
      status: 'Open'
    },
    {
      docNo: 'PO-103',
      lineNo: '1',
      itemCode: 'SAP-1003',
      itemDescription: 'SAP API License',
      qty: 5,
      openQty: 0,
      status: 'Open'
    },
    {
      docNo: 'PO-104',
      lineNo: '1',
      itemCode: 'SAP-1004',
      itemDescription: 'ERP Module Extension',
      qty: 15,
      openQty: 5,
      status: 'Open'
    }
  ];

  // Static data for SAP Documents - Production Orders
  sapDocProductionOrderData = [
    {
      docNo: 'PRO-201',
      docDate: '2025-02-05',
      itemCode: 'SAPPR-101',
      productName: 'SAP Integration Gateway',
      qty: 10,
      openQty: 3,
      status: 'Open'
    },
    {
      docNo: 'PRO-202',
      docDate: '2025-02-10',
      itemCode: 'SAPPR-102',
      productName: 'ERP System Core',
      qty: 5,
      openQty: 5,
      status: 'Open'
    },
    {
      docNo: 'PRO-203',
      docDate: '2025-02-15',
      itemCode: 'SAPPR-103',
      productName: 'Database Connector',
      qty: 20,
      openQty: 0,
      status: 'Open'
    },
    {
      docNo: 'PRO-204',
      docDate: '2025-02-20',
      itemCode: 'SAPPR-104',
      productName: 'SAP Analytics Module',
      qty: 8,
      openQty: 4,
      status: 'Open'
    }
  ];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _itemSamplesService: ItemSamplesService,
  ) { }

  ngOnInit(): void {
   // Set the initial view to 'sapDocuments' instead of 'evaluationPlan'
   this.currentView = 'sapDocuments';
  
   // Call updateTableView to initialize the table with sapDocuments data
   this.updateTableView();
 
    // React to order type changes
    this.orderTypeControl.valueChanges.subscribe(() => {
      this.updateTableView();
    });

    // Setup search functionality
    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });
  }

  updateTableView(): void {
    const orderType = this.orderTypeControl.value;
    
    if (this.currentView === 'evaluationPlan') {
      this.pageTitle = 'List of Evaluation Plan';
      
      if (orderType === 'purchaseOrder') {
        this.displayedColumns = ['serialId', 'docNo', 'docDate', 'lineNo', 'itemCode', 'itemDescription', 'qty', 'status', 'action'];
        this.dataSource.data = this.evalPlanPurchaseOrderData;
      } else if (orderType === 'productionOrder') {
        this.displayedColumns = ['serialId', 'docNo', 'docDate', 'itemCode', 'productName', 'qty', 'status', 'action']; 
        this.dataSource.data = this.evalPlanProductionOrderData;
      }
    } else if (this.currentView === 'sapDocuments') {
      this.pageTitle = 'List of SAP Documents';
      
      if (orderType === 'purchaseOrder') {
        this.displayedColumns = ['serialId', 'docNo', 'lineNo', 'itemCode', 'itemDescription', 'qty', 'openQty', 'status', 'action'];
        this.dataSource.data = this.sapDocPurchaseOrderData;
      } else if (orderType === 'productionOrder') {
        this.displayedColumns = ['serialId', 'docNo', 'docDate', 'itemCode', 'productName', 'qty', 'openQty', 'status', 'action'];
        this.dataSource.data = this.sapDocProductionOrderData;
      }
    }
    
    // Reset paginator when data changes
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  toggleView(): void {
    this.currentView = this.currentView === 'evaluationPlan' ? 'sapDocuments' : 'evaluationPlan';
    this.updateTableView();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Method to apply filter on the dataSource
  applyFilter(searchTerm: string): void {
    if (!searchTerm) {
      // If search term is empty, reset filter
      this.dataSource.filter = '';
      return;
    }
    
    searchTerm = searchTerm.trim().toLowerCase();
    this.dataSource.filter = searchTerm;
    
    // Reset to first page when filtering
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  onBackdropClicked(): void {
    console.log('On Back Drop Clicked');
    this.matDrawer.close();
    this._router.navigate(['./'], { relativeTo: this._activatedRoute });
  }

  actionEditItemData(element: any): void {
    console.log('Edit item:', element);
    // Navigate to edit page with item data
    this._router.navigate(['edit-item-sample'], { 
      state: { data: element }, 
      relativeTo: this._activatedRoute 
    });
  }
}