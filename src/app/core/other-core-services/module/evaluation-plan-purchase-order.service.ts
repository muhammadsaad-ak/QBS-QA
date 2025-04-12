import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluationPlanPurchaseOrderService {
  private _httpClient = inject(HttpClient);

  // BehaviorSubject to hold role data state
  private _listQualitativeResults = new BehaviorSubject<any[]>([]);
  private _itemIdSAP = new BehaviorSubject<any[]>([]);
  private _sampleQty = new BehaviorSubject<any[]>([]);
  private _qcPurchaseCode = new BehaviorSubject<any[]>([]);

  // Observable to expose role data state
  listQualitativeResults$: Observable<any[]> = this._listQualitativeResults.asObservable();
  itemIdSAP$: Observable<any[]> = this._itemIdSAP.asObservable();
  sampleQty$: Observable<any[]> = this._sampleQty.asObservable();
  qcPurchaseCode$: Observable<any[]> = this._qcPurchaseCode.asObservable(); // For Purchase QC API





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

  // ADD PURCHASE ORDER API
  AddPurchaseOrder(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });

    return this._httpClient.post(
      `${environment.appApiUrl}/CSAPI/IPurchaseQCFeature/AddPurchaseQC`,
      data,
      { headers }
    ).pipe(
      tap(response => console.log('RESPONSE:', response)),
      catchError(error => {
        console.error('Error adding purchase order', error);
        return throwError(() => new Error('Error adding purchase order'));
      })
    );
  }

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
          this._itemIdSAP.next(fetchedItemId);
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
          this._sampleQty.next(fetchedSampleQuantity);
          console.log('FETCHED RESPONSE', fetchedSampleQuantity);
        }),
        catchError((error) => {
          console.error('ERROR WHILE FETCHING SAMPLE QTY', error);
          return throwError(error);
        })
      );
  }

  getPurchaseQCCode(): Observable<any> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'text/plain',
    });

    return this._httpClient
        .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=purchase_qc`, { headers })
        .pipe(
            tap((purchaseQCCode) => {
                const purchaseQCResultsCode = (purchaseQCCode as any) ?? [];
                this._qcPurchaseCode.next(purchaseQCResultsCode);
                console.log('Fetched code for Purchase QC:', purchaseQCResultsCode);
            }),
            catchError((error) => {
                console.error('Error fetching Purchase QC Code:', error);
                return throwError(() => new Error('Error fetching Purchase QC Code'));
            })
        );
}
  // GET FLEXIBILITY API  - @IAK
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
  // GET isSamplePassed API - @IAK
  getIsSamplePassedListByQcId(qcId: string): Observable<boolean[]> {
    if (!qcId) {
      console.error('QC ID IS MISSING, CANNOT PROCEED FUTTHER!:');
      return throwError(() => new Error('QC ID IS MISSING, CANNOT PROCEED FUTTHER'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    // console.log('ACCESS TOKEN ~ this.accessToken:', this.accessToken);
    // console.log('HEADERS ~ headers:', headers);
    // console.log('URL ~ appApiUrl :', `${environment.appApiUrl}/CSAPI/IPurchaseQCSampleFeature/ListAllPurchaseQCSamplesByQcId?purchaseQcId=${qcId}`);
    console.log('QC ID ~ qcId:', qcId);

    return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/IPurchaseQCSampleFeature/ListAllPurchaseQCSamplesByQcId?purchaseQcId=${qcId}`, { headers })
      .pipe(
        tap((response: any) => {
          // console.log('SERVER RESPONSE ~ response:', response);
        }),
        map((response: any) => {
          const data = response?.data ?? [];
          const isSamplePassedList = data.map((item: any) => item.isSamplePassed);
          console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);
          return isSamplePassedList;
        }),
        catchError((error) => {
          console.error('API CALLING FAILED:', error);
          console.error('ERROR STATUS:', error.status);
          console.error('ERROR MESSAGE:', error.error?.message);
          return throwError(() => new Error('FAILED TO FETCH isSamplePassedList!'));
        })
      );
  }
}
