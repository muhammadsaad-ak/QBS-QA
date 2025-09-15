import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, formatDate } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, interval } from 'rxjs';
import { finalize } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QcSharedApiService } from 'app/core/other-core-services/module/qc-shared-api.service';
import { IncomingMaterialsQcService } from 'app/core/other-core-services/module/incoming-materials-qc.service';

// INTERFACES
// materialData
export interface MaterialData {
  docNum: string;
  docDate: string;
  itemCode: string;
  itemDescription: string;
  vendor: string;
  vendorCode: string;
  warehouse: string;
  lineNum: number;
  documentStatus?: string;
  plantName?: string;
  itemId?: string;
  batchCode?: string;
  intCode?: string;
  analyzedBy?: string;
  inspectionDateTime?: string;
  isEditMode?: boolean;
  [key: string]: any;
}

export interface IncomingQcPayload {
  itemId: string;
  itemCode: string;
  itemDescription: string;
  analyzedBy: string;
  lineNo: number;
  vendor: string;
  warehouse: string;
  bmrLoc: string;
  docStatus: string;
  docNo: string;
  docDate: string;
  docType: string;
  inspectionQuantity: number;
  inspectionDateTime: string;
  evaluationStatus: string | null;
  batchCode: string;
  overallStatus: boolean;
  remarks: string | null;
  isPerformed: boolean;
  isPostedToSap: boolean;
  isClosed: boolean;
  operatedBy: string;
  barcode: string | null;
  isBarcodeGenerated: boolean;
  reportReviewDate: string | null;
  reportNextReviewDate: string | null;
  reportRemarks: string | null;
  sapQuantity: number;
  receiveQuantity: number;
  isActive: boolean;
}

@Component({
  selector: 'app-perform-incoming-materials-qc',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './perform-incoming-materials-qc.component.html',
  styleUrls: ['./perform-incoming-materials-qc.component.scss']
})

export class PerformIncomingMaterialsQcComponent implements OnInit, OnDestroy {
  incomingMaterialQCFormGroup!: FormGroup;

  materialData: MaterialData | null = null;
  docNum!: string | null;
  isEditMode: boolean = false;

  private inspectionTimeInterval: any;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _qcSharedApiService: QcSharedApiService,
    private _incomingQcService: IncomingMaterialsQcService,
  ) { }

  ngOnInit(): void {
    // STEP 1: GET NAVIGATION STATE DATA
    this.loadNavigationData();

    // VALIDATE ESSENTIAL FIELDS BEFORE PROCEEDING
    if (!this.materialData?.itemCode || !this.materialData?.docNum) {
      console.warn('MISSING REQUIRED DATA FIELDS IN materialData.');
      this.redirectWithError();
      return;
    }

    // STEP 2: BUILD THE FORM
    this.buildForm();

    // STEP 3: PATCH VALUES IF DATA IS AVAILABLE
    if (this.materialData) {
      this.patchFormValues();
      this.setupInspectionTimer();
      this.autoSyncQuantities();
    } else {
      this.handleInvalidData();
    }
  }

  ngOnDestroy(): void {
    if (this.inspectionTimeInterval) {
      clearInterval(this.inspectionTimeInterval);
    }
    this.destroy$.next(); // emitEvent COMPLETION
    this.destroy$.complete(); // emitEvent CLEANUP
    // OPTIONAL RESET
    this.materialData = null;
  }

  // loadNavigationData
  private loadNavigationData(): void {
    // GET docNum FROM route snapshot
    this.docNum = this.route.snapshot.paramMap.get('docNum');

    // ACCESSING THE NAVIGATION STATE TO RETRIEVE INCOMING MATERIAL QC DATA
    // this.materialData = history.state?.materialData;
    this.materialData = this.router.getCurrentNavigation()?.extras.state?.['materialData'] || history.state?.materialData;
    console.log('materialData from state:', this.materialData);

    this.isEditMode = this.materialData?.isEditMode === true;
    console.log('isEditMode', this.isEditMode);
  }

  // BUILD THE FORM
  private buildForm(): void {
    this.incomingMaterialQCFormGroup = this.fb.group({
      documentStatus: [null],
      docEntry: [null],
      docNo: [null],
      docDate: [null],
      vendor: [null],
      vendorCode: [null],
      lineNum: [null],
      lineNo: [null],
      itemCode: [null],
      itemDescription: [null],
      quantity: [null],
      price: [null],
      lineStatus: [null],
      remainingOpenQuantity: [null],
      vatGroup: [null],
      warehouse: [null],
      uoM: [null],
      analyzedBy: [null, Validators.required],
      batchCode: [null],
      inspectionDateTime: [null],
      inspectionTime: [null],
      intCode: [null],
      itemId: [null, Validators.required],
      qcLotNo: [null],
      receiveQuantity: [null, Validators.required],
      inspectionQuantity: [null, Validators.required],
      sapQuantity: [null],
      remarks: [null],
      id: [null],
      isPerformed: [null],
      isPostedToSap: [null],
      overallStatus: [null],
      isClosed: [null],
    });
  }

  // PATCH VALUES IF DATA IS AVAILABLE
  private patchFormValues(): void {
    if (!this.materialData) return;

    if (this.materialData) {

      // SET VALUES FOR docNo, docStatus, lineNo, sapQuantity
      this.incomingMaterialQCFormGroup.patchValue({
        ...this.materialData,
        docNo: this.materialData.docNum,
        docStatus: this.materialData.documentStatus,
        lineNo: this.materialData.lineNum,
        sapQuantity: this.materialData.quantity,
      });
      // console.log('materialData AFTERpatchFormValues',this.materialData);

    } else {
      console.warn('⚠️ NO INCOMING QC DATA FOUND.');
      this.router.navigate(['/sap-documents/list-of-incoming-materials']);
    }

    if (this.isEditMode) {
      this.patchEditModeValues();
    } else {
      this.patchAddModeValues();
    }
  }
  private patchAddModeValues(): void {
    if (!this.materialData) return;

    // CALLING getItemId API TO SET itemId
    this.getItemId(this.materialData.itemCode);
    // CALLING getQCLotNo API TO SET qcLotNo
    const itemCode = this.materialData.itemCode;
    const plantName = this.materialData?.plantName ?? '';
    const docNo = this.materialData.docNum;
    const docDate = this.materialData.docDate;
    const warehouseCode = this.materialData.warehouse;
    this.getQCLotNo(itemCode, plantName, docNo, docDate, warehouseCode);
    // CALLING getIncomingQcCode API TO SET intCode
    this.getQCodeIncomingQc();
    // analyzedBy
    const sessionUserData = JSON.parse(localStorage.getItem('user') || '{}');
    const sessionUserType = sessionUserData?.userType || '';
    this.incomingMaterialQCFormGroup.patchValue({ analyzedBy: sessionUserType });
  }
  private patchEditModeValues(): void {
    if (!this.materialData) return;

    // itemId
    const itemId = this.materialData?.itemId ?? '-';
    this.incomingMaterialQCFormGroup.get('itemId')?.setValue(itemId);
    // qcLotNo
    // batchCode
    const batchCode = this.materialData?.batchCode ?? '-';
    this.incomingMaterialQCFormGroup.patchValue({
      qcLotNo: batchCode,
      batchCode: batchCode
    });
    // intCode
    const formattedIntCode = this.formatIntCode(this.materialData?.intCode);
    this.incomingMaterialQCFormGroup.get('intCode')?.setValue(formattedIntCode);

    // analyzedBy
    const analyzedBy = this.materialData?.analyzedBy ?? '';
    this.incomingMaterialQCFormGroup.patchValue({ analyzedBy });

    // SET sapQuantity this.isEditMode
    if (this.isEditMode) {
      const { intCode, ...rest } = this.materialData;
      this.incomingMaterialQCFormGroup.patchValue({
        ...rest,
        sapQuantity: this.materialData.sapQuantity,
        quantity: this.materialData.sapQuantity,
      });
    }
  }

  // SET inspectionDateTime (PAKISTAN TIMEZONE)
  private setupInspectionTimer(): void {
    if (this.isEditMode) {
      const incomingDate = this.materialData.inspectionDateTime;
      const dateObj = new Date(incomingDate);

      if (!isNaN(dateObj.getTime())) {
        const isoString = dateObj.toISOString();
        const timeOnly = formatDate(dateObj, 'hh:mm:ss a', 'en-US');
        this.incomingMaterialQCFormGroup.patchValue({
          inspectionDateTime: isoString,
          inspectionTime: timeOnly
        });
      }
      return;
    }
    // RxJS interval
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      const currentDateTimePK = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
      const timeOnly = formatDate(currentDateTimePK, 'hh:mm:ss a', 'en-US');
      this.incomingMaterialQCFormGroup.patchValue({
        inspectionDateTime: new Date().toISOString(),
        inspectionTime: timeOnly
      });
    });
  }

  private autoSyncQuantities(): void {
    this.incomingMaterialQCFormGroup.get('receiveQuantity')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val: number) => {
      this.incomingMaterialQCFormGroup.get('inspectionQuantity')?.setValue(val, { emitEvent: false });
    });
  }

  // APIs
  // itemId
  private getItemId(itemCode: string): void {
    this._qcSharedApiService.getItemByCode(itemCode).subscribe({
      next: (response) => {
        if (response && response.length > 0) {
          // const itemId = response[0].id;
          const itemId = response?.[0]?.id ?? '';
          this.incomingMaterialQCFormGroup.get('itemId')?.setValue(itemId);
        }
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to fetch ItemId';
        console.error('SERVICE ERROR (getItemByCode):', errorMsg);

        this._snackBar.open(errorMsg, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });

        this.incomingMaterialQCFormGroup.get('itemId')?.reset();
      },
      // error: (err) => this.handleError('getItemByCode', err),
    });
  }

  // qcLotNo
  private getQCLotNo(itemCode: string, plantName: string, docNo: string, docDate: string, warehouseCode: string): void {
    this._qcSharedApiService.getQcLotNo(itemCode, plantName, docNo, docDate, warehouseCode).subscribe({
      next: (qcLotNo) => {
        if (qcLotNo) {
          // this.incomingMaterialQCFormGroup.get('qcLotNo')?.setValue(qcLotNo);
          // this.incomingMaterialQCFormGroup.get('batchCode')?.setValue(qcLotNo);
          this.incomingMaterialQCFormGroup.patchValue({ qcLotNo, batchCode: qcLotNo });
        }
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to fetch QC Lot No';
        console.error('SERVICE ERROR (getQcLotNo):', errorMsg);

        this._snackBar.open(errorMsg, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });

        this.incomingMaterialQCFormGroup.get('qcLotNo')?.reset();
      },
    });
  }

  // intCode
  private getQCodeIncomingQc(): void {
    this._qcSharedApiService.getIncomingQcQCode().subscribe({
      next: (incomingQcCode) => {
        const formattedIntCode = `IQC-${incomingQcCode.toString().padStart(5, '0')}`;
        this.incomingMaterialQCFormGroup.get('intCode')?.setValue(formattedIntCode);
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to fetch Q-Code';
        console.error('SERVICE ERROR (getIncomingQcCode):', errorMsg);

        this._snackBar.open(errorMsg, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
        this.incomingMaterialQCFormGroup.get('intCode')?.reset();
      },
    });
  }

  // POST API
  onSaveIncomingQC(): void {
    // STOPPING THE inspectionTime INTERVAL
    if (this.inspectionTimeInterval) {
      clearInterval(this.inspectionTimeInterval);
      this.inspectionTimeInterval = null;
    }

    if (this.incomingMaterialQCFormGroup.invalid) {
      this._snackBar.open('Please fill all mandatory fields', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }
    const formValues = this.incomingMaterialQCFormGroup.value

    // PREPARING PAYLOAD FOR POST API
    // MAPPING THE FORM FIELDS TO CONSTRUCT THE PAYLOAD
    const payload: IncomingQcPayload = {
      itemId: formValues.itemId,
      itemCode: formValues.itemCode,
      itemDescription: formValues.itemDescription,
      analyzedBy: formValues.analyzedBy,
      lineNo: formValues.lineNum,
      vendor: formValues.vendor,
      warehouse: formValues.warehouse,
      bmrLoc: '',
      docStatus: formValues.documentStatus,
      docNo: String(formValues.docNo),
      docDate: new Date(formValues.docDate).toISOString(),
      docType: 'GRN',
      inspectionQuantity: formValues.inspectionQuantity,
      inspectionDateTime: new Date().toISOString(),
      evaluationStatus: null,
      batchCode: formValues.qcLotNo,
      overallStatus: false,
      remarks: null,
      isPerformed: true,
      isPostedToSap: false,
      isClosed: false,
      operatedBy: formValues.analyzedBy,
      barcode: null,
      // batchNo: null,
      isBarcodeGenerated: false,
      reportReviewDate: null,
      reportNextReviewDate: null,
      reportRemarks: null,
      sapQuantity: formValues.quantity,
      receiveQuantity: formValues.receiveQuantity,
      isActive: true
    };
    console.log('FINAL PAYLOAD POST API:', payload);
    // return;
    // CALLING addIncomingQC POST API TO SAVE DATA
    this._incomingQcService.addIncomingQC(payload).subscribe({
      next: (result) => {
        this._snackBar.open('Incoming QC saved successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.router.navigate(['/sap-documents/list-of-evaluation-plan-incoming-qc']);
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to save Incoming QC';
        this._snackBar.open(errorMsg, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  // PUT API
  onUpdateIncomingQC(): void {
    const formValues = this.incomingMaterialQCFormGroup.value
    console.log(formValues)
    // return;
    // PREPARING PAYLOAD FOR PUT API
    const payload = {
      id: formValues.id,
      overallStatus: !!formValues.overallStatus,
      remarks: formValues.remarks || 'Closed due to unknown reasons',
      inspectionDateTime: formValues.inspectionDateTime,
      isPerformed: !!formValues.isPerformed,
      isPostedToSap: !!formValues.isPostedToSap,
      isClosed: !!formValues.isClosed,
      isActive: true,
    };
    console.log('FINAL PAYLOAD PUT API:', payload);
    return;
    // CALLING updateIncomingQC PUT API
    this._incomingQcService.updateIncomingQC(payload).subscribe({
      next: (result) => {
        this._snackBar.open('Record updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.router.navigate(['/sap-documents/list-of-evaluation-plan-incoming-qc']);
      },
      error: (err) => {
        const errorMsg = err.message || 'Failed to update Incoming QC';
        this._snackBar.open(errorMsg, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  formatDateTime(value: string | null): string {
    if (!value) return '';
    // return formatDate(value, 'dd/MM/yyyy', 'en-US');
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return formatDate(date, 'dd/MM/yyyy', 'en-US'); // 31/12/2025
  }

  formatFullDateTime(value: string | null): string {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return formatDate(date, 'M/d/yyyy h:mm a', 'en-US');  // 31/12/2025 11:59 PM
  }

  private redirectWithError(): void {
    console.warn('⚠️ NO INCOMING QC DATA FOUND.');
    const fallbackRoute = this.isEditMode
      ? '/sap-documents/list-of-evaluation-plan-incoming-qc'
      : '/sap-documents/list-of-incoming-materials';

    this._snackBar.open('Invalid or incomplete data received.', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-error'],
    });
    this.router.navigate([fallbackRoute]);
  }

  private handleInvalidData(): void {
    console.warn('⚠️ NO INCOMING QC DATA FOUND.');
    this.showSnack('Invalid or incomplete data received.', 'error');
    const fallbackRoute = this.isEditMode
      ? '/sap-documents/list-of-evaluation-plan-incoming-qc'
      : '/sap-documents/list-of-incoming-materials';
    this.router.navigate([fallbackRoute]);
  }

  private showSnack(message: string, type: 'success' | 'error'): void {
    this._snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [type === 'success' ? 'snackbar-success' : 'snackbar-error']
    });
  }

  private handleError(context: string, err: any): void {
    const msg = err.message || `Failed during ${context}`;
    console.error(`${context}:`, msg);
    this._snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: ['snackbar-error'],
    });
  }

  private formatIntCode(code: number | string | null | undefined): string {
    if (code === null || code === undefined || code === '') {
      return 'IQC-00000'; // fallback when no code is available
    }
    return `IQC-${code.toString().padStart(5, '0')}`;
  }
}