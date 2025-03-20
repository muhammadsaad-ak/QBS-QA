import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, of, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class EvaluationPlanProductionOrderService {
  private _httpClient = inject(HttpClient);

  // BehaviorSubject to hold role data state
  private _itemIdIIC = new BehaviorSubject<any[]>([]);
  private _sampleQtyProduction = new BehaviorSubject<any[]>([]);

  // Observable to expose role data state
  itemIdSAP$: Observable<any[]> = this._itemIdIIC.asObservable();
  sampleQty$: Observable<any[]> = this._sampleQtyProduction.asObservable();

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
}
