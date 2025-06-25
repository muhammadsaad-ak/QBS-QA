import { ChangeDetectorRef, Component } from '@angular/core';
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
import { SessionStorageService } from 'app/core/other-core-services/module/session-storage.service';
import { ListOfEvaluationPlanPurchaseOrderService } from 'app/core/other-core-services/module/list-of-evaluation-plan-purchase-order.service';
import { EvaluationPlanQaOrderService } from 'app/core/other-core-services/module/evaluation-plan-qa-order.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QbsConfirmationIICService } from '@qbs/services/confirmation/confirmation-iic.service';

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

  displayedColumnsItemsInspectionCards: string[] = ['serialId', 'itemCode', 'itemDescription', 'cardCode', 'isBatch', 'action'];
  dataSourceItemsInspectionCards = new MatTableDataSource<any>(this.ListIAlltemsInspectionCards);
  // dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSourceItemsInspectionCards.paginator = this.paginator;
  }

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private _qbsConfirmationService: QbsConfirmationService,
    private _qbsConfirmationIICService: QbsConfirmationIICService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _itemInspectionCardService: ItemInspectionCardService,
    private _sessionStorageService: SessionStorageService,
    private _purchaseQCService: ListOfEvaluationPlanPurchaseOrderService,
    private _productionQAService: EvaluationPlanQaOrderService,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    // @IAK
    // interface ItemMapValue FOR MAPPING THE VALUES
    interface ItemMapValue {
      itemCode: string;
      isBatch: boolean;
      groupName: string;
      type: string;
      groupCode: string;
      u_QACard: string;
      uoMGroupEntry: string;
    }
    forkJoin({
      inspectionCards: this._itemInspectionCardService.ListAllItemsInspectionCards(),
      items: this._itemInspectionCardService.getListAllItems()
    }).subscribe(({ inspectionCards, items }) => {

      // Map itemId to itemCode in the inspectionCards response

      // const itemMap = new Map(items.data.map(item => [item.id, item.itemCode]));

      // const itemMap = new Map<string, ItemMapValue>(
      //   items.data.map(item => [
      //     item.id,
      //     { itemCode: item.itemCode, isBatch: item.isBatch }
      //   ])
      // );

      // @IAK
      // Create an object to match the ItemMapValue interface
      const itemMap = new Map<string, ItemMapValue>(
        items.data.map(item => [
          item.id,
          {
            itemCode: item.itemCode,
            isBatch: item.isBatch,
            groupName: item.groupName,
            type: item.type,
            groupCode: item.groupCode,
            u_QACard: item.u_QACard,
            uoMGroupEntry: item.uoMGroupEntry,
          }
        ])
      );

      // console.log('ITEMS:', items.data);
      // console.log('MAPPED RESPONSE:', itemMap); // MAPPED AGAINST itemId
      // console.log('INSPECTION CARDS:', inspectionCards.data);
      // console.log('INSPECTION CARDS:', inspectionCards.data.map(card => card.itemId));
      // console.log('ITEMS:', items.data.map(item => item.id));
      // console.log('ITEMS:', items.data.map(item => item.itemCode));
      // console.log('ITEMS:', items.data.map(item => item.isBatch));
      // console.log('ITEMS:', items.data.map(item => item.id).includes(inspectionCards.data[0].itemId));
      // console.log('ITEMS:', itemMap.get(inspectionCards.data[0].itemId));
      // console.log('ITEMS:', itemMap.get(inspectionCards.data[0].itemId)?.itemCode);
      // console.log('ITEMS:', itemMap.get(inspectionCards.data[2].itemId)?.isBatch);
      // console.log('ITEMS:', itemMap.get(inspectionCards.data[2].itemId)?.isBatch === true ? 'YES' : 'NO');

      // Map itemId to itemCode in the inspectionCards response
      
      // @IAK
      this.ListIAlltemsInspectionCards = inspectionCards.data.filter(card => card.isActive).map(card => ({
        ...card,
        itemCode: itemMap.get(card.itemId)?.itemCode || 'N/A',
        isBatch: itemMap.get(card.itemId)?.isBatch || false,
        groupName: itemMap.get(card.itemId)?.groupName || 'N/A',
        type: itemMap.get(card.itemId)?.type || 'N/A',
        groupCode: itemMap.get(card.itemId)?.groupCode || 'N/A',
        u_QACard: itemMap.get(card.itemId)?.u_QACard || 'N/A',
        uoMGroupEntry: itemMap.get(card.itemId)?.uoMGroupEntry || 'N/A',
      }));

      // this.ListIAlltemsInspectionCards = inspectionCards.data.map(card => ({
      //   ...card,
      //   itemCode: itemMap.get(card.itemId) || 'N/A'
      // }));

      // this.ListIAlltemsInspectionCards = inspectionCards.data.map(card => ({
      //   ...card,
      //   itemCode: itemMap.get(card.itemId)?.itemCode || 'N/A',
      //   isBatch: itemMap.get(card.itemId)?.isBatch || false
      // }));

      // Assign updated data to table
      this.dataSourceItemsInspectionCards.data = this.ListIAlltemsInspectionCards;
    });

    this.searchInputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((searchTerm: string) => {
        this.applyFilter(searchTerm);
      });

    this._sessionStorageService.clearAll();

    // this._itemInspectionCardService.ListAllItemsInspectionCards().subscribe((items) => {
    //   this.dataSourceItemsInspectionCards.data = items.data;
    // })
    // const navigationState = history.state.updatedData;  // CHECK IF THERE IS UPDATED DATA FROM NAVIGATION
    // if (navigationState) {
    //   const updatedData = navigationState;
    //   // UPDATING ListIAlltemsInspectionCards WITH THE NEW DATA
    //   this.ListIAlltemsInspectionCards = this.ListIAlltemsInspectionCards.map(item =>
    //     item.cardCode === updatedData.cardCode ? updatedData : item
    //   );
    //   // REFRESHING THE TABLE DATA SOURCE - dataSourceItemsInspectionCards
    //   this.dataSourceItemsInspectionCards = new MatTableDataSource<any>(this.ListIAlltemsInspectionCards);
    // }
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

  XopenStepperToUpdateIIC(rowDataIIC: any): void {
    console.log('SENDING IIC DATA:', rowDataIIC);
    const dataToSendIntoStepperIIC = {
      ...rowDataIIC, isEditMode: true
    };
    sessionStorage.setItem('stepperDataIIC', JSON.stringify(dataToSendIntoStepperIIC));
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 4 }
    });
  }

  // @IAK
  openStepperToUpdateIIC(rowDataIIC: any): void {
    const rowItemCode = rowDataIIC.itemCode;
    // Null or Undefined itemCode check
    if (!rowItemCode) {
      console.warn('Item code is missing in the selected row');
      return;
    }
    // Parallel API calls with error handling using forkJoin + catchError
    forkJoin({
      purchaseQC: this._purchaseQCService.getEvaluationPlanPurchaseOrders().pipe(
        catchError(err => {
          console.error('Error fetching Purchase QC:', err);
          return of({ data: [] }); // fallback to empty array
        })
      ),
      productionQC: this._purchaseQCService.getEvaluationPlanProductionOrders().pipe(
        catchError(err => {
          console.error('Error fetching Production QC:', err);
          return of({ data: [] });
        })
      ),
      productionQA: this._productionQAService.getEvaluationPlanProductionOrdersQA().pipe(
        catchError(err => {
          console.error('Error fetching Production QA:', err);
          return of({ data: [] });
        })
      )
    }).subscribe(({ purchaseQC, productionQC, productionQA }) => {
      // Safe extraction, in case data is null
      const purchaseData = Array.isArray(purchaseQC?.data) ? purchaseQC.data : [];
      const productionQCData = Array.isArray(productionQC?.data) ? productionQC.data : [];
      const productionQAData = Array.isArray(productionQA?.data) ? productionQA.data : [];
      // Match checks - Matching itemCode against all three responses
      const matchPurchaseQC = purchaseData.some(item =>
        rowItemCode === item.itemDetails?.itemCode
      );
      const matchProductionQC = productionQCData.some(item =>
        rowItemCode === item.itemDetails?.itemCode
      );
      const matchProductionQA = productionQAData.some(item =>
        rowItemCode === item.itemDetails?.itemCode
      );
      // Color-coded logging for exact match source
      if (matchPurchaseQC) {
        console.log('%c✔ Matched in: Purchase QC', 'color: white; background: #007acc; padding: 2px 6px; border-radius: 3px;');
      }
      if (matchProductionQC) {
        console.log('%c✔ Matched in: Production QC', 'color: white; background: #28a745; padding: 2px 6px; border-radius: 3px;');
      }
      if (matchProductionQA) {
        console.log('%c✔ Matched in: Production QA', 'color: white; background: #ff9800; padding: 2px 6px; border-radius: 3px;');
      }
      // Combined Summary
      console.log('%cMatch Results:', 'font-weight: bold; color: red;', {
        matchPurchaseQC,
        matchProductionQC,
        matchProductionQA
      });
      // If matched in any list, show confirmation
      if (matchPurchaseQC || matchProductionQC || matchProductionQA) {
        const confirmation = this._qbsConfirmationIICService.openIIC({
          title: 'Confirmation',
          message: 'QC or QA is already performed on this item inspection card. Do you want to update it by creating a new one?',
          actions: {
            confirm: { label: 'Yes, Create' },
            cancel: { label: 'No, Cancel' },
            view: { label: 'View Only' },
          },
        });

        confirmation.afterClosed().subscribe((result) => {
          if (result === 'confirmed') {
            const dataToSendIntoStepperIICNew = {
              ...rowDataIIC,
              isEditMode: true,
              isIICNewAdd: true,
            };
            sessionStorage.setItem('stepperDataIICNew', JSON.stringify(dataToSendIntoStepperIICNew));
            this._router.navigate(['/master-data/list-of-testing-stepper'], {
              queryParams: { step: 5 },
            });
          } else if (result === 'view') {
            const dataToSendIntoStepperIIC = {
              ...rowDataIIC,
              isEditMode: true,
              isViewMode: true,
            };
            sessionStorage.setItem('stepperDataIIC', JSON.stringify(dataToSendIntoStepperIIC));
            this._router.navigate(['/master-data/list-of-testing-stepper'], {
              queryParams: { step: 5 },
            });
          } else {
            console.log('%c✖ User cancelled creation of new IIC', 'color: red; font-weight: bold;');
            return;
          }
        });
      } else {
        // No match found — go with regular update
        const dataToSendIntoStepperIIC = {
          ...rowDataIIC,
          isEditMode: true,
        };
        sessionStorage.setItem('stepperDataIIC', JSON.stringify(dataToSendIntoStepperIIC));
        this._router.navigate(['/master-data/list-of-testing-stepper'], {
          queryParams: { step: 5 },
        });
      }
    });
  }

  openStepperToCloneIIC(rowDataIIC: any): void {
    console.log('SENDING IIC DATA:', rowDataIIC);
    const dataToSendIntoStepperIIC = {
      ...rowDataIIC, isEditMode: true, isCloneIIC: true
    };
    sessionStorage.setItem('stepperDataIIC', JSON.stringify(dataToSendIntoStepperIIC));
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 5 }
    });
  }

  openStepperToAddIIC(): void {
    sessionStorage.removeItem('stepperDataIIC');
    this._router.navigate(['/master-data/list-of-testing-stepper'], {
      queryParams: { step: 5 }
    });
  }
}
