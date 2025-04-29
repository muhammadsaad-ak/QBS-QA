import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

interface ProductionQcBMRResponse {
  isApiHandled: boolean;
  isRequestSuccess: boolean;
  statusCode: number;
  message: string;
  data: string;
  exception: any[];
}

@Injectable({
  providedIn: 'root'
})

export class EvaluationPlanProductionOrderService {
  private _httpClient = inject(HttpClient);

  // BehaviorSubject to hold role data state
  private _itemIdIIC = new BehaviorSubject<any[]>([]);
  private _sampleQtyProduction = new BehaviorSubject<any[]>([]);
  private _qcProductionCode = new BehaviorSubject<any[]>([]);
  private _qualityStatus = new BehaviorSubject<any>(null);


  // Observable to expose role data state
  itemIdSAP$: Observable<any[]> = this._itemIdIIC.asObservable();
  sampleQty$: Observable<any[]> = this._sampleQtyProduction.asObservable();
  qcProductionCode$: Observable<any[]> = this._qcProductionCode.asObservable(); // For Purchase QC API


  /**
   * Setter & getter for access token
   */
  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  constructor() { }

  // ADD API
  // GET API
  // UPDATE API

  // GET ITEM ID API
  GetItemIdByCode(itemCode: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });

    return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/IItemCardFeature/GetItemByCode?itemCode=${itemCode}`, { headers })
      .pipe(
        tap((itemId) => {
          // console.log('API RESPONSE:', itemId);
          const fetchedItemId = (itemId as any).data ?? [];
          this._itemIdIIC.next(fetchedItemId);
          // console.log('FETCHED RESPONSE', fetchedItemId);
        }),
        catchError((error) => {
          console.error('ERROR WHILE FETCHING ITEM ID', error);
          return throwError(error);
        })
      );
  }
  
  // GET SAMPLE QTY API
  getSampleQuantityRange(inspectionQuantity: number, itemId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });

    return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/IPurchaseQCFeature/GetSampleQuantity?inspectionQuantity=${inspectionQuantity}&itemId=${itemId}`, { headers })
      .pipe(
        tap((sampleQuantity) => {
          console.log('API RESPONSE:', sampleQuantity);
          const fetchedSampleQuantity = (sampleQuantity as any).data ?? [];
          this._sampleQtyProduction.next(fetchedSampleQuantity);
          console.log('FETCHED RESPONSE', fetchedSampleQuantity);
        }),
        catchError((error) => {
          console.error('ERROR WHILE FETCHING SAMPLE QTY', error);
          return throwError(error);
        })
      );
  }

  getProductionQCCode(): Observable<any> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'text/plain',
    });

    return this._httpClient
        .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=production_qc`, { headers })
        .pipe(
            tap((productionQCCode) => {
                const productionQCResultsCode = (productionQCCode as any) ?? [];
                this._qcProductionCode.next(productionQCResultsCode);
                console.log('Fetched code for Production QC:', productionQCResultsCode);
            }),
            catchError((error) => {
                console.error('Error fetching Production QC Code:', error);
                return throwError(() => new Error('Error fetching Prodcution QC Code'));
            })
        );
}

  AddProductionOrder(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });

    return this._httpClient.post(
      `${environment.appApiUrl}/CSAPI/IProductionQCFeature/AddProductionQC`,
      data,
      { headers }
    ).pipe(
      tap(response => console.log('RESPONSE:', response)),
      catchError(error => {
        console.error('Error adding production order', error);
        return throwError(() => new Error('Error adding production order'));
      })
    );
  }
  
  // GET flexibility API - @IAK
  getFlexibilityByItemId(itemId: string): Observable<boolean> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });

    return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/IItemSampleFeature/GetItemSampleByItemId?itemId=${itemId}`, { headers })
      .pipe(
        map((response: any) => {
          const isFlexible = response?.data?.flexibility ?? false;
          console.log('getItemFlexibility → isFlexible', isFlexible);
          return isFlexible;
        }),
        catchError((error) => {
          console.error('ERROR WHILE FETCHING FLEXIBILITY:', error);
          return of(false);
        })
      );
  }
  // PUT API TO CLOSE OPEN QC FORCEFULLY - @IAK
  updateToCloseOpenProductionQC(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });
    console.log("SENDING PAYLOAD", data);
    return this._httpClient.put(
      `${environment.appApiUrl}/CSAPI/IProductionQCFeature/UpdateProductionQC`,
      data,
      { headers }
    ).pipe(
      tap(response => console.log('PUT RESPONSE:', response)),
      catchError(error => {
        console.error('ERROR WHILE CLOSING OPEN QC', error);
        return throwError(() => error);
      })
    );
  }
  // GET Q-STATUS API - @IAK
  getQualityStatusQCProduction(entityName: string, itemCode: string, docNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });

    return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetQualityStatus?entityName=${entityName}&itemCode=${itemCode}&docNumber=${docNumber}`, { headers })
      .pipe(
        tap((qualityStatus) => {
          console.log('API RESPONSE:', qualityStatus);
          const fetchedQualityStatus = (qualityStatus as any).data ?? {};
          this._qualityStatus.next(fetchedQualityStatus);
          console.log('FETCHED Q-STATUS RESPONSE', fetchedQualityStatus);
        }),
        catchError((error) => {
          console.error('ERROR WHILE FETCHING QUALITY STATUS', error);
          return throwError(error);
        })
      );
  }
  // PUT API TO CLOSE OPEN QC FORCEFULLY - @IAK
  updateToCloseOpenQC(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });
    console.log("SENDING PAYLOAD", data);
    return this._httpClient.put(
      `${environment.appApiUrl}/CSAPI/IProductionQCFeature/UpdateProductionQC`,
      data,
      { headers }
    ).pipe(
      tap(response => console.log('PUT RESPONSE:', response)),
      catchError(error => {
        console.error('ERROR WHILE CLOSING OPEN QC', error);
        return throwError(() => error);
      })
    );
  }
  // GET BMR BATCH NO API - @IAK
  getProductionQcBMRByQcId(qcId: string): Observable<string> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this._httpClient
      .get<ProductionQcBMRResponse>(
        `${environment.appApiUrl}/CSAPI/IProductionQCFeature/GetProductionQcBMRByQcId?qcId=${qcId}`,
        { headers }
      )
      .pipe(
        tap((response: ProductionQcBMRResponse) => {
          if (response.isRequestSuccess) {
            console.log('getProductionQcBMRByQcId FETCHED SUCCESSFULLY: ', response.data);
          } else {
            console.warn('FAILED TO FETCH PRODUCTION getProductionQcBMRByQcId: ', response.message);
          }
        }),
        switchMap((response: ProductionQcBMRResponse) => {
          if (response.isRequestSuccess) {
            return of(response.data); // RETURN ONLY THE "data"
          } else {
            return throwError(() => new Error(response.message));
          }
        }),
        catchError((error) => {
          console.error('HTTP ERROR WHILE FETCHING PRODUCTION QC BMR', error);
          return throwError(() => error);
        })
      );
  }
}
