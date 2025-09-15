import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { SessionStorageService } from 'app/core/other-core-services/module/session-storage.service';
import { SAPAllServices } from 'app/core/other-core-services/module/sap-list-all-services.service';
import { EvaluationPlanPurchaseOrderService } from 'app/core/other-core-services/module/evaluation-plan-purchase-order.service';
import { QcSharedApiService } from 'app/core/other-core-services/module/qc-shared-api.service';

interface IncomingMaterial {
  isPerformed?: boolean;
  overallStatus: any;
  isClosed: any;
  serialNo: number;
  docEntry: number;
  docNum: number;
  docDate: string;
  cardCode: string;
  cardName: string;
  lineNum: number;
  itemCode: string;
  itemDescription: string;
  quantity: number;
  price: number;
  lineStatus: string;
  remainingOpenQuantity: number;
  vatGroup: string;
  warehouse: string;
  uoM: string;
  qStatus: string;
  qCode: string;
  vendor?: string;
  vendorCode?: string;
  documentStatus?: string;
}

@Component({
  selector: 'app-list-of-incoming-materials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './list-of-incoming-materials.component.html',
  styleUrls: ['./list-of-incoming-materials.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ListOfIncomingMaterialsComponent implements OnInit, OnDestroy {
  title = 'List of Incoming Materials';
  subTitle = 'Good Receive Note (GRN)';
  switchButtonTitle = 'Switch to Evaluation Plan';

  isLoading = false;
  searchInputControl = new FormControl('');

  dataSourceIncomingMaterials = new MatTableDataSource<IncomingMaterial>([]);

  displayedColumnsIncomingMaterials: string[] = [
    'serialNo',
    'docEntry', //  HIDDEN
    'docGRNo',  //  HIDDEN  - docNum
    'itemName',
    'itemCode',
    'vendorName',
    'vendorCode',
    'materialIncomingDate', //  docDate
    'incomingQty',
    'remainingOpenQuantity',
    'lineNum',
    'price',
    'vatGroup',
    'warehouse',
    'uoM',
    'lineStatus',  //  documentStatus
    'grnStatus',  //  documentStatus
    'qStatus',
    'qCode',
    'actions',
  ];

  // @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) paginator?: MatPaginator;

  totalRecords = 0;   // totalRecords in ListAllGRNS API
  pageSize = 10;      // DEFAULT pageSize ListAllGRNS API
  currentPage = 1;    // CURRENT pageNumber ListAllGRNS API

  private destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _sapAllServices: SAPAllServices,
    private _qcSharedApiService: QcSharedApiService,
    private _evaluationPurchaseOrderService: EvaluationPlanPurchaseOrderService,
  ) { }

  ngOnInit(): void {
    this.fetchIncomingMaterials();

    this.searchInputControl.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((term: string) => this.applyFilter(term));

    this.dataSourceIncomingMaterials.filterPredicate = (data: IncomingMaterial, filter: string) => {
      const search = filter.trim().toLowerCase();
      return (
        data.itemDescription?.toLowerCase().includes(search) ||
        data.itemCode?.toLowerCase().includes(search) ||
        data.vendor?.toLowerCase().includes(search)
      );
    };
  }

  // ngAfterViewInit() {}

  // ngAfterViewChecked() {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1; // paginator 0-based, API 1-based
    this.fetchIncomingMaterials();
  }

  trackByDocLine(index: number, item: IncomingMaterial): string {
    return `${item.docNum}-${item.lineNum}`;
  }


  applyFilter(searchTerm: string): void {
    if (!searchTerm) {
      this.dataSourceIncomingMaterials.filter = '';
      this.paginator?.firstPage();
      return;
    }
    const term = (searchTerm || '').trim().toLowerCase();
    this.dataSourceIncomingMaterials.filter = term;
    this.paginator?.firstPage();
  }

  fetchIncomingMaterials(): void {
    this.isLoading = true;
    this._sapAllServices.getAllGRNs(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.isLoading = false))).subscribe({
        next: (res) => {
          if (res.succeeded && res.data?.values?.length > 0) {
            const rows = res.data.values.map((grn, index) => ({
              serialNo: (this.currentPage - 1) * this.pageSize + (index + 1),
              ...grn,
              isClosed: null,
              overallStatus: null,
            }));

            this.dataSourceIncomingMaterials.data = rows;
            this.totalRecords = res.data.totalRecords;
            // this._cdr.detectChanges();
            this.fetchQualityStatusForRows(rows);
            this._cdr.markForCheck();
          } else {
            this.dataSourceIncomingMaterials.data = [];
            this.totalRecords = 0;

            this.showSnack('Invalid session or session already timed out.');
          }
        },
        error: (err) => this.showSnack(err.message || 'Failed to load GRNs'),
      });
  }

  performIncomingQC(element: IncomingMaterial): void {
    const isClosed = (element as any).isClosed;
    if (isClosed === 'InProgress') {
      this.showSnack('An open QC document is already in progress, kindly complete that first.');
      return;
    }
    // SHALLOW COPY
    const { serialNo, qStatus, qCode, overallStatus, ...filteredIncomingQCdata } = element;
    console.log('SENDING SAP GRN DATA FOR PERFORMING INCOMING QC DATA', filteredIncomingQCdata);
    this._router.navigate(['/sap-documents/perform-incoming-materials-qc', element.docNum], {
      state: { materialData: filteredIncomingQCdata },
    });
  }

  navigateEvaluationPlanIncomingQC() {
    this._router.navigate(['/sap-documents/list-of-evaluation-plan-incoming-qc']);
  }

  private fetchQualityStatusForRows(rows: IncomingMaterial[]): void {
    if (!rows || rows.length === 0) {
      return;
    }
    rows.forEach((row, idx) => {
      const entityName = 'incoming_qc';
      const itemCode = row.itemCode != null ? row.itemCode : '';
      const docNumber = row.docNum != null ? String(row.docNum) : '';
      const lineNo = row.lineNum != null ? row.lineNum : '';

      this._qcSharedApiService
        .getQualityStatus(entityName, itemCode, docNumber)
        .pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            console.error(`ERROR FETCHING Q-STATUS FOR docNumber ${docNumber}`, error);
            return of({ data: { isClosed: null, overallStatus: null } });
          })
        )
        .subscribe((qualityResponse: any) => {
          const qData = (qualityResponse && qualityResponse.data) ? qualityResponse.data : {};
          const currentData = this.dataSourceIncomingMaterials.data;
          const foundIndex = currentData.findIndex(
            r => String(r.docNum) === docNumber && (r.lineNum ?? 0) === (lineNo ?? 0)
          );

          if (foundIndex !== -1) {
            console.log('Q-Status API RESPONSE FOR', {
              entityName: entityName,
              docNum: docNumber,
              itemCode: itemCode,
              lineNo: lineNo,
              response: qualityResponse
            });

            const isClosedValue = qData.isClosed;
            const overallStatusValue = qData.overallStatus;
            const isPerformedValue = qData.isPerformed;

            currentData[foundIndex].isClosed = isClosedValue === true ? 'Closed' : isClosedValue === false ? 'InProgress' : null;
            currentData[foundIndex].overallStatus = overallStatusValue === true ? 'Passed' : overallStatusValue === false ? 'Failed' : null;
            currentData[foundIndex].isPerformed = isPerformedValue;

            if (isPerformedValue === true && isClosedValue === false) {
              currentData[foundIndex].qStatus = 'InProgress';
            } else if (isPerformedValue === true && isClosedValue === true) {
              currentData[foundIndex].qStatus = 'Pending';
            } else {
              currentData[foundIndex].qStatus = 'Pending';
            }

            this.dataSourceIncomingMaterials.data = [...currentData];
          }
        });
      this._cdr.markForCheck();
    });
  }

  private showSnack(message: string, type: 'error' | 'success' = 'error'): void {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'error' ? ['snackbar-error'] : ['snackbar-success'],
    });
  }
}