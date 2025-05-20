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
import { debounceTime } from 'rxjs';
import { SapPlanPurchaseOrderService } from 'app/core/other-core-services/module/sap-plan-purchase-order.service';
import { ListOfEvaluationPlanPurchaseOrderService } from 'app/core/other-core-services/module/list-of-evaluation-plan-purchase-order.service';
import { PageEvent } from '@angular/material/paginator';
import { SapPlanProductionOrderService } from 'app/core/other-core-services/module/sap-plan-production-order.service';
import { EvaluationPlanQaOrderService } from 'app/core/other-core-services/module/evaluation-plan-qa-order.service';
import { EvaluationPlanPurchaseOrderService } from 'app/core/other-core-services/module/evaluation-plan-purchase-order.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EvaluationPlanProductionOrderService } from 'app/core/other-core-services/module/evaluation-plan-production-order.service';

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
  orderType: string = 'purchaseOrder'; // ✅ Isko define karna zaroori hai
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
    // {
    //   docNo: 'PO-001',
    //   docDate: '2025-02-10',
    //   lineNo: '1',
    //   itemCode: 'ITM-1001',
    //   itemDescription: 'Steel Plate 10mm',
    //   qty: 50,
    //   status: 'Pas'
    // },

  ];

  // Static data for Evaluation Plan - Production Orders
  evalPlanProductionOrderData = [
    // {
    //   docNo: 'PRO-001',
    //   docDate: '2025-02-12',
    //   itemCode: 'PROD-101',
    //   productName: 'Metal Frame Assembly',
    //   qty: 25,
    //   status: 'Fail'
    // },
    
  ];

  evalPlanProductionOrderQAData = [
    // {
    //   docNo: 'PRO-001',
    //   docDate: '2025-02-12',
    //   itemCode: 'PROD-101',
    //   productName: ' Frame Assembly',
    //   qty: 35,
    //   status: 'Fail'
    // },
  ];

  // Static data for SAP Documents - Purchase Orders
  sapDocPurchaseOrderData = [
  ];

  // Static data for SAP Documents - Production Orders
  sapDocProductionOrderData = [
  ];

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    private _purchaseOrderService:SapPlanPurchaseOrderService,
    private _productionOrderService:SapPlanProductionOrderService,
    private _purchaseQCService: ListOfEvaluationPlanPurchaseOrderService,
    private _productionQCService: ListOfEvaluationPlanPurchaseOrderService,
    private _evaluationPlanQaOrderService: EvaluationPlanQaOrderService,
    private _productionQAService: EvaluationPlanQaOrderService,
    private _evaluationPurchaseOrderService: EvaluationPlanPurchaseOrderService,
    private _evaluationPlanProductionOrderService: EvaluationPlanProductionOrderService,
    private _snackBar: MatSnackBar,
  ) {
    this.dataSource = new MatTableDataSource([]);
   }

   totalRecords = 0;  // Total items in API
  pageSize = 10;      // Default page size
  currentPage = 1;    // Current page number
// dataSource = new MatTableDataSource([]);

   

ngOnInit(): void {
  // Set the initial view to 'sapDocuments'
  this.currentView = 'sapDocuments';
  
  // Single subscription for orderTypeControl changes
  this.orderTypeControl.valueChanges.subscribe((orderType) => {
    this.orderType = orderType; // Store the value
    
    // Only fetch SAP data if we're in the sapDocuments view
    if (this.currentView === 'sapDocuments') {
      this.onOrderTypeChange(orderType);
    } else if (this.currentView === 'evaluationPlan') {
      this.onEvaluationPlanTypeChange(orderType);
    }
    
    // Always update the table view based on current view and order type
    this.updateTableView();
  });

  // Initial API call for SAP documents
  this.fetchSapDocPurchaseOrders();
  
  // Initialize the table with appropriate data
  this.updateTableView();

  // Setup search functionality
  this.searchInputControl.valueChanges
    .pipe(debounceTime(300))
    .subscribe((searchTerm: string) => {
      this.applyFilter(searchTerm);
    });
}
  onOrderTypeChange(orderType: string): void {
    if (orderType === 'purchaseOrder') {
        this.fetchSapDocPurchaseOrders();
    } else if (orderType === 'productionOrder') {
        this.fetchSapDocProductionOrders();
    } 
}

  // Handle API calls when order type changes in Evaluation Plan
onEvaluationPlanTypeChange(orderType: string): void {
  if (this.currentView !== 'evaluationPlan') return;

  if (orderType === 'purchaseOrder') {
    this.fetchEvaluationPlanPurchaseOrders();
  } else if (orderType === 'productionOrder') {
    this.fetchEvaluationPlanProductionOrders();
  } else if (orderType === 'productionOrderQA') {
    this.fetchEvaluationPlanProductionOrdersQA();
  }
}

  // API se SAP Documents ke Purchase Orders fetch karna
  fetchSapDocPurchaseOrders(): void {
    this._purchaseOrderService.getPurchaseOrders(this.currentPage, this.pageSize).subscribe((response: any) => {
      if (response.succeeded) {
        this.sapDocPurchaseOrderData = response.data.values.map((order, index) => ({
          serialId: index + 1 + (this.currentPage - 1) * this.pageSize, 
          docNo: order.docNum,
          docDate: order.docDate,
          lineNum: order.lineNum,
          itemCode: order.itemCode,
          itemDescription: order.itemDescription,
          qty: order.quantity,
          openQty: order.remainingOpenQuantity,
          status: order.documentStatus,
          warehouse: order.warehouse,
          cardName: order.cardName,
          isClosed: null, // INITIALIZE isClosed          
          // action: 'View'
        }));
  
        // ✅ MatTableDataSource ko update karo
        this.dataSource = new MatTableDataSource(this.sapDocPurchaseOrderData);
  
        // ✅ Total records ko update karo, taake paginator sahi kaam kare
        this.totalRecords = response.data.totalRecords;
        // ✅ Call getQualityStatus for each purchase order
        this.sapDocPurchaseOrderData.forEach((order, index) => {
          this._evaluationPurchaseOrderService
            .getQualityStatusQC('purchase_qc', order.itemCode, order.docNo, order.lineNum)
            .subscribe({
              next: (qualityResponse) => {
                console.log(`Quality Status for ${order.docNo}:`, qualityResponse);
                // Optionally update the order object or UI based on qualityResponse
                // Example: order.qualityStatus = qualityResponse.data.overallStatus;

                // Update the isClosed property for the specific order
                this.sapDocPurchaseOrderData[index].isClosed = qualityResponse.data.isClosed;
                // Trigger table update
                this.dataSource.data = [...this.sapDocPurchaseOrderData];
              },
              error: (error) => {
                console.error(`Error fetching quality status for ${order.docNo}:`, error);
                // Optionally set a default value on error
                this.sapDocPurchaseOrderData[index].isClosed = false;
                this.dataSource.data = [...this.sapDocPurchaseOrderData];
              }
            });
        });
      } else {
        console.error('Failed to fetch SAP Purchase Orders', response.message);
      }
    });
  }
  //Fetching Production Orders API
  fetchSapDocProductionOrders(): void {
    this._productionOrderService.getProductionOrders(this.currentPage, this.pageSize).subscribe((response: any) => {
        if (response.succeeded) {
            this.sapDocProductionOrderData = response.data.values.map((order, index) => ({
                serialId: index + 1 + (this.currentPage - 1) * this.pageSize,
                docNo: order.docNum,
                docDate: order.docDate,
                itemCode: order.itemCode,
                itemDescription: order.productName,
                qty: order.plannedQuantity,
                openQty: order.plannedQuantity - order.completedQuantity,
                status: order.productionOrderStatus,
                lotNo: order.lotNo,
                warehouse: order.warehouse,
                machine: order.machine,
                bmr:order.bmr,
                mold:order.mold,
                cavity: order.cavity,
                cycleTime: order.cycleTime,
                weight: order.weight,
                variant: order.variant,
                shift: order.shift, 
                isClosed: null, // INITIALIZE isClosed      
                bmrLoc: order.plant,
              }));

            // ✅ MatTableDataSource ko update karo
            this.dataSource = new MatTableDataSource(this.sapDocProductionOrderData);
            console.log('SAP Production Orders lol:', this.sapDocProductionOrderData);

            // ✅ Total records ko update karo, taake paginator sahi kaam kare
            this.totalRecords = response.data.totalRecords;
          // ✅ Call getQualityStatus for each production order
          this.sapDocProductionOrderData.forEach((order, index) => {
            this._evaluationPlanProductionOrderService
              .getQualityStatusQCProduction('production_qc', order.itemCode, order.docNo)
              .subscribe({
                next: (qualityResponse) => {
                  console.log(`Quality Status for ${order.docNo}:`, qualityResponse);
                  // Optionally update the order object or UI based on qualityResponse
                  // Example: order.qualityStatus = qualityResponse.data.overallStatus;

                  // Update the isClosed property for the specific order
                  this.sapDocProductionOrderData[index].isClosed = qualityResponse.data.isClosed;
                  // Trigger table update
                  this.dataSource.data = [...this.sapDocProductionOrderData];
                },
                error: (error) => {
                  console.error(`Error fetching quality status for ${order.docNo}:`, error);
                  // Optionally set a default value on error
                  this.sapDocProductionOrderData[index].isClosed = false;
                  this.dataSource.data = [...this.sapDocProductionOrderData];
                }
              });
          });
        } else {
            console.error('Failed to fetch SAP Production Orders', response.message);
        }
    });
  }

  fetchEvaluationPlanPurchaseOrders(): void {
  this._purchaseQCService.getEvaluationPlanPurchaseOrders().subscribe((response: any) => {
      if (response.data) {
          this.evalPlanPurchaseOrderData = response.data.map((order, index) => ({
              // serialId: index + 1,
              id: order.id,
              intCode: order.intCode, 
              itemCode: order.itemDetails?.itemCode || '-',
              itemDescription: order.itemDetails?.name || '-',
              docDate: order.docDate,
              docNo: order.docNo,
              warehouse: order.warehouse,
              sapQuantity: order.sapQuantity || 0,
              openQuantity: order.openQuantity || 0,
              vendor: order.vendor || '-',
              sampleQuantity: order.sampleQuantity || 0,
              lineNum: order.lineNum || order.lineNo || 0, // Add line number
              qcLotNo: order.qcLotNo || '-', // Add QC Lot number
              receiveQuantity : order.receiveQuantity || 0,
              inspectionQuantity: order.inspectionQuantity || 0,
              analyzedBy: order.analyzedBy || '-',
              qty: order.poQuantity || 0,
              status: order.status || '-',
              isClosed: order.isClosed,   // isClosed: order.isClosed || 'In-Progress',
              remarks: order.remarks,
              inspectionDateTime: order.inspectionDateTime,
          }));

          this.dataSource = new MatTableDataSource(this.evalPlanPurchaseOrderData);
           // Important: Assign paginator here
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.totalRecords = this.evalPlanPurchaseOrderData.length;
      });
      } else {
          console.error('Failed to fetch Evaluation Plan Purchase Orders', response.message);
      }
  });
  }

  fetchEvaluationPlanProductionOrders(): void {
    this._productionQCService.getEvaluationPlanProductionOrders().subscribe((response: any) => {
      if (response.data) {
        this.evalPlanProductionOrderData = response.data.map((order, index) => ({
          // serialId: index + 1,
          id: order.id,
          intCode: order.intCode,
          docNo: order.docNo,
          docDate: order.docDate,
          itemCode: order.itemDetails?.itemCode || '-',
          itemDescription: order.itemDetails?.name || '-',
          qty: order.plannedQuantity || 0,
          status: order.status || '-',
          analyzedBy: order.analyzedBy || '-',
          warehouse: order.warehouse,
          sampleQuantity: order.sampleQuantity || 0,
          openQuantity: order.openQuantity || 0,
          qcLotNo: order.qcLotNo || '-',
          shift: order.shift || '-',
          machineNo: order.machineNo || '-', 
          variant: order.variant || '-',
          bmrNo: order.bmrNo || '-',
          mouldNo: order.mouldNo || '-',
          cavity: order.cavity || '-',
          cycleTime: order.cycleTime || 0,
          itemWeight: order.itemWeight || 0,
          inspectionQuantity: order.inspectionQuantity || 0,
          isClosed: order.isClosed,   // isClosed: order.isClosed || 'In-Progress',
          bmrLoc: order.bmrLoc || 'N/A',
          remarks: order.remarks,
          receiptQuantity: order.receiptQuantity || null,
          operatedBy: order.operatedBy || null,

        }));
  
        if (this.orderType === 'productionOrder') {
          this.dataSource = new MatTableDataSource(this.evalPlanProductionOrderData);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
          });
          this.totalRecords = this.evalPlanProductionOrderData.length;
          console.log('Evaluation Plan Production Orders:', this.evalPlanProductionOrderData);
        }
      } else {
        console.error('Failed to fetch Evaluation Plan Production Orders', response.message);
      }
    });
  }

  fetchEvaluationPlanProductionOrdersQA(): void {
    this._productionQAService.getEvaluationPlanProductionOrdersQA().subscribe((response: any) => {
      if (response.data) {
        this.evalPlanProductionOrderQAData = response.data.map((order, index) => ({
          // serialId: index + 1,
          id: order.id,
          intCode: order.intCode,
          docNo: order.docNum,
          docDate: order.docDate,
          itemCode: order.itemDetails?.itemCode || '-',
          itemDescription: order.itemDetails?.name || '-',
          qty: order.plannedQuantity || 0,
          status: order.status || '-',
          analyzedBy: order.analyzedBy || '-',
          warehouse: order.warehouse,
          sampleQuantity: order.sampleQuantity || 0,
          openQuantity: order.openQuantity || 0,
          qcLotNo: order.qcLotNo || '-',
          shift: order.shift || '-',
          machineNo: order.machineNo || '-', 
          variant: order.variant || '-',
          bmrNo: order.bmrNo || '-',
          mouldNo: order.mouldNo || '-',
          cavity: order.cavityNo || '-',
          cycleTime: order.cycleTime || 0,
          itemWeight: order.itemWeight || 0,
          inspectionQuantity: order.inspectionQuantity || 0,
          remarks: order.remarks,
          isClosed: order.isClosed,   // isClosed: order.isClosed || 'In-Progress',

        }));
  
        if (this.orderType === 'productionOrderQA') {
          this.dataSource = new MatTableDataSource(this.evalPlanProductionOrderQAData);
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
          });
          this.totalRecords = this.evalPlanProductionOrderQAData.length;
          console.log('Evaluation Plan Production Orders QA:', this.evalPlanProductionOrderQAData);
        }
      } else {
        console.error('Failed to fetch Evaluation Plan Production Orders', response.message);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  
    if (this.currentView === 'sapDocuments') {
      if (this.orderType === 'purchaseOrder') {
        this.fetchSapDocPurchaseOrders();
        console.log('SAP Purchase Orders fetched');
      } else if (this.orderType === 'productionOrder') {
        this.fetchSapDocProductionOrders();
        console.log('SAP Production Orders fetched');
      }
    } else if (this.currentView === 'evaluationPlan') {
      if (this.orderType === 'purchaseOrder') {
        this.fetchEvaluationPlanPurchaseOrders();
        console.log('Evaluation Plan Purchase Orders fetched');
      } else if (this.orderType === 'productionOrder') {
        this.fetchEvaluationPlanProductionOrders();
        console.log('Evaluation Plan Production Orders fetched');
      } else if (this.orderType === 'productionOrderQA') {
        this.fetchEvaluationPlanProductionOrdersQA();
        console.log('Evaluation Plan Production Orders QA fetched');
      }
    }
  }
  updateTableView(): void {
    const orderType = this.orderTypeControl.value;
    
    if (this.currentView === 'evaluationPlan') {
      this.pageTitle = 'List of Evaluation Plan';
      
      if (orderType === 'purchaseOrder') {
        this.displayedColumns = ['serialId', 'intCode', 'docDate','lineNo', 'itemCode', 'itemDescription', 'qty', 'status', 'id', 'action'];
        this.dataSource.data = this.evalPlanPurchaseOrderData;       
      } else if (orderType === 'productionOrder') {
        this.displayedColumns = ['serialId', 'intCode', 'docDate', 'itemCode', 'itemDescription', 'qty', 'receiptQty', 'status', 'action']; 
        this.dataSource.data = this.evalPlanProductionOrderData;
      } else if (orderType === 'productionOrderQA') {
        this.displayedColumns = ['serialId' , 'intCode' , 'docDate' , 'itemCode' , 'itemDescription' , 'qty' , 'status' , 'action'];
        this.dataSource.data = this.evalPlanProductionOrderQAData;
      }
    } else if (this.currentView === 'sapDocuments') {
      this.pageTitle = 'List of SAP Documents';
      
      if (orderType === 'purchaseOrder') {
        this.displayedColumns = ['serialId', 'docNo',  'docDate', 'lineNo', 'itemCode', 'itemDescription', 'qty', 'openQty', 'status','inspectionStatus', 'action'];
        this.dataSource.data = this.sapDocPurchaseOrderData;
      } else if (orderType === 'productionOrder') {
        this.displayedColumns = ['serialId', 'docNo', 'docDate', 'itemCode', 'itemDescription', 'qty', 'openQty', 'status', 'inspectionStatus', 'action'];
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
    console.log('Current View:', this.currentView);
  
    if (this.currentView === 'evaluationPlan') {
      if (this.orderType === 'purchaseOrder') {
        this.fetchEvaluationPlanPurchaseOrders();
      } else if (this.orderType === 'productionOrder') {
        this.fetchEvaluationPlanProductionOrders();
      } else if (this.orderType === 'productionOrderQA') {
        this.fetchEvaluationPlanProductionOrdersQA();
      }
    } else if (this.currentView === 'sapDocuments') {
      if (this.orderType === 'purchaseOrder') {
        this.fetchSapDocPurchaseOrders();
      } else if (this.orderType === 'productionOrder') {
        this.fetchSapDocProductionOrders();
      }
    }
  
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
//FINAL CHANGES
  // navigateToOrderForm(element: any) {
  //   const orderType = this.orderTypeControl.value; // Check selected order type
    
  //   if (orderType === 'purchaseOrder') {
  //     this.router.navigate(['/evaluation-plan/plan-purchase-order'], { 
  //       relativeTo: this._activatedRoute,
  //       state: { selectedOrder: element } // Pass the selected row data
  //     });
  //   } else if (orderType === 'productionOrder') {
  //     this.router.navigate(['/evaluation-plan/plan-production-order'], { 
  //       relativeTo: this._activatedRoute,
  //       state: { selectedOrder: element } // Pass the selected row data
  //     });
  //   }
  // }

  navigateToOrderForm(element: any) {
    console.log('SENDING DATA:', element);
    const orderType = this.orderTypeControl.value; // Get selected order type
  
    if (this.currentView === 'sapDocuments') {
      // Navigating from SAP Documents (Perform QC)
      if (orderType === 'purchaseOrder') {
        this.router.navigate(['/evaluation-plan/plan-purchase-order'], {
          state: { selectedOrder: element, from: 'sapDocuments' } // Pass origin info
        });
      } else if (orderType === 'productionOrder') {
        this.router.navigate(['/evaluation-plan/plan-production-order'], {
          state: { selectedOrder: element, from: 'sapDocuments' }
        });
      }
    } else if (this.currentView === 'evaluationPlan') {
      // Navigating from Evaluation Plan (Edit QC)
      if (orderType === 'purchaseOrder') {
        this.router.navigate(['/evaluation-plan/plan-purchase-order'], {
          state: { selectedOrder: element, from: 'evaluationPlan' }
        });
      } else if (orderType === 'productionOrder') {
        this.router.navigate(['/evaluation-plan/plan-production-order'], {
          state: { selectedOrder: element, from: 'evaluationPlan' }
        });
      }
    }
  }

  navigateToEvaluationPlanQAForm(element: any) {
    console.log('SENDING DATA of Production Order QA:', element);
    this.router.navigate(['/evaluation-plan/plan-evaluation-qa'],{
      state: { selectedOrder: element, from: 'sapDocuments' } // Pass the selected row data and origin info
    }

    );
    // Pass the selected row data and origin info
  }

  navigateToEditQA(element: any) {
    console.log('SENDING DATA for Edit QA:', element);
    this.router.navigate(['/evaluation-plan/plan-evaluation-qa'], {
      state: { selectedOrder: element, from: 'evaluationPlan' }
    });
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'text-blue';
      case 'In Progress':
        return 'text-orange';
      case 'Pass':
        return 'text-green';
      case 'Fail':
        return 'text-red';
      default:
        return ''; // Default class if no match
    }
  }
  handlePerformQC(element: any): void {
    console.log('isClosed- ',element.isClosed);
    if (element.isClosed === true || element.isClosed == null) {
      this.navigateToOrderForm(element);
    } else {
      this._snackBar.open('An open QC document is already in progress, kindly complete that first.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }
}
