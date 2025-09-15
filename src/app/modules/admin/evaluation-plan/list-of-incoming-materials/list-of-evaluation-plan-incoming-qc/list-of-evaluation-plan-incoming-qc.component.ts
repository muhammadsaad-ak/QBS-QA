import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { QbsConfirmationService } from '@qbs/services/confirmation';
import { SessionStorageService } from 'app/core/other-core-services/module/session-storage.service';
import { SAPAllServices } from 'app/core/other-core-services/module/sap-list-all-services.service';
import { EvaluationPlanPurchaseOrderService } from 'app/core/other-core-services/module/evaluation-plan-purchase-order.service';
import { IncomingMaterialsQcService } from 'app/core/other-core-services/module/incoming-materials-qc.service';

// INTERFACES
export interface EvaluationPlanIncomingQcRow {
  serialNo: number;
  docNum?: string;
  isEditMode?: boolean;
  itemId?: string;
  itemCode?: string;
  itemName?: string;
  itemDescription?: string;
  itemCategory?: string | null;
  itemCategoryCode?: string | null;
  id: string;
  intCode: number;
  docNo: string;
  docStatus: string;
  docDate: string;
  docType: string;
  evaluationStatus?: string | null;
  batchCode: string;
  overallStatus: boolean;
  isPerformed: boolean;
  isPostedToSap: boolean;
  isClosed: boolean;
  inspectionQuantity?: number | null;
  inspectionDateTime?: string | null;
  analyzedBy: string;
  remarks?: string | null;
  operatedBy: string;
  barcode?: string | null;
  isBarcodeGenerated: boolean;
  reportReviewDate?: string | null;
  reportNextReviewDate?: string | null;
  reportRemarks?: string | null;
  lineNo: number;
  receiveQuantity: number;
  sapQuantity?: number | null;
  vendor: string;
  warehouse: string;
  bmrLoc: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
  isActive: boolean;
  isArchived: boolean;
  [key: string]: any;
}

@Component({
  selector: 'app-list-of-evaluation-plan-incoming-qc',
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
  templateUrl: './list-of-evaluation-plan-incoming-qc.component.html',
  styleUrls: ['./list-of-evaluation-plan-incoming-qc.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class ListOfEvaluationPlanIncomingQcComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'List of Evaluation Plan - Incoming QC';
  switchButtonTitle = 'Switch to GRNs';

  isLoading = false;
  isDataLoaded = false;
  searchInputControl = new FormControl('');

  displayedColumnsEvaluationPlanIncomingQC: string[] = [
    'serialNo',
    'id',
    'intCode',
    'docNo',
    'itemName',
    'itemCode',
    'vendor',
    'docDate',
    'inspectionDateTime',
    'batchCode',
    'evaluationStatus',
    'overallStatus',
    'remarks',
    'isPerformed',
    'isPostedToSap',
    'isClosed',
    'analyzedBy',
    'operatedBy',
    'barcode',
    'isBarcodeGenerated',
    'reportReviewDate',
    'reportNextReviewDate',
    'reportRemarks',
    'sapQuantity',
    'receiveQuantity',
    'inspectionQuantity',
    'isActive',
    'itemId',
    'itemCategory',
    'itemCategoryCode',
    'approvedBy',
    'actions',
  ];

  totalRecords = 0;
  pageSize = 10;
  currentPage = 1;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatPaginator, { static: false }) paginator?: MatPaginator;
  dataSourceEvaluationPlanIncomingQC = new MatTableDataSource<EvaluationPlanIncomingQcRow>([]);
  private destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private _qbsConfirmationService: QbsConfirmationService,
    private _sessionStorageService: SessionStorageService,
    private _incomingQcService: IncomingMaterialsQcService,

  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.isDataLoaded = true;
    this.fetchIncomingQCs();

    this.searchInputControl.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((term: string) => this.applyFilter(term));

    this.dataSourceEvaluationPlanIncomingQC.filterPredicate = (data: any, filter: string): boolean => {
      const search = filter.trim().toLowerCase();

      const dataStr = Object.values(data)
        .map(value => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            return JSON.stringify(value);
          }
          return value.toString();
        })
        .join(' ')
        .toLowerCase();
      return dataStr.includes(search);
    };
  }

  ngAfterViewInit() {
    this.dataSourceEvaluationPlanIncomingQC.paginator = this.paginator;
    this._cdr.markForCheck();
  }

  // ngAfterViewChecked() {
  //   if (this.dataSourceEvaluationPlanIncomingQC &&
  //     this.paginator &&
  //     this.dataSourceEvaluationPlanIncomingQC.paginator !== this.paginator) {
  //     this.dataSourceEvaluationPlanIncomingQC.paginator = this.paginator;
  //   }
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(searchTerm: string): void {
    if (!searchTerm) {
      this.dataSourceEvaluationPlanIncomingQC.filter = '';
      this.paginator?.firstPage();
      return;
    }
    const term = (searchTerm || '').trim().toLowerCase();
    this.dataSourceEvaluationPlanIncomingQC.filter = term;
    this.paginator?.firstPage();
  }

  // GET APIS
  // ListAllIncomingQCsWithItem
  fetchIncomingQCs(): void {
    this.isLoading = true;

    this._incomingQcService.getAllIncomingQCsWithItem().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        console.log('ListAllIncomingQCsWithItem API Response:', res.data);
        if (res.isRequestSuccess && res.data?.length > 0) {
          const rows = res.data.map((incomingQC: any, index: number) => {
            const { itemDetails, ...restOfIncomingQC } = incomingQC;

            return {
              serialNo: index + 1,
              itemId: itemDetails?.id,
              itemCode: itemDetails?.itemCode,
              itemName: itemDetails?.name,
              itemDescription: itemDetails?.name,
              itemCategory: itemDetails?.category,
              itemCategoryCode: itemDetails?.categoryCode,
              ...restOfIncomingQC,
            };
          });

          this.dataSourceEvaluationPlanIncomingQC.data = rows;

          // this.dataSourceEvaluationPlanIncomingQC.paginator = this.paginator;
          // if (this.paginator) {
          //   this.paginator.firstPage();
          // }

          if (this.paginator) {
            this.dataSourceEvaluationPlanIncomingQC.paginator = this.paginator;
            this.paginator.length = this.totalRecords;
            this.paginator.firstPage();
          } else {
            setTimeout(() => {
              if (this.paginator) {
                this.dataSourceEvaluationPlanIncomingQC.paginator = this.paginator;
                this.paginator.length = this.totalRecords;
                this.paginator.firstPage();
                this._cdr.detectChanges();
              }
            });
          }
        } else {
          this.dataSourceEvaluationPlanIncomingQC.data = [];
          this._snackBar.open(res.message || 'No records found', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        }

        setTimeout(() => {
          this.isLoading = false;
          this._cdr.detectChanges();
          this._cdr.markForCheck();
        }, 750);

      },
      error: (err) => {
        this._snackBar.open(err.message || 'Failed to load Evaluation Plan Incoming QCs', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
        this.isLoading = false;
      },
    });
  }

  performIncomingQCUpdate(element: any) {
    // DESTRUCTURING
    const { docNo, ...rest } = element;
    const materialData = {
      ...rest,
      docNum: docNo, isEditMode: true,
    };
    // console.log('SENDING EVALUATION PLAN INCOMING QC DATA', materialData);
    // return;
    this._router.navigate(['/sap-documents/perform-incoming-materials-qc', docNo], {
      state: { materialData }
    });
  }

  navigateIncomingMaterialsQC() {
    this._router.navigate(['/sap-documents/list-of-incoming-materials']);
  }

  private showSnack(message: string, type: 'error' | 'success' = 'error'): void {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'error' ? ['snackbar-error'] : ['snackbar-success'],
    });
  }
}