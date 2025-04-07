import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SapPlanProductionOrderService {
  private _httpClient = inject(HttpClient);

// BehaviorSubject to hold role data state:
  private _productionOrders = new BehaviorSubject<any[]>([]);
  private _getProductionQcId = new BehaviorSubject<any[]>([])
  private _cardByCode = new BehaviorSubject<any[]>([])
  private _getProductionByQcCode = new BehaviorSubject<any[]>([])
  private _getProductionQcSampleId = new BehaviorSubject<any[]>([])




  // Observable to expose role data state:
  sapproductionorder$: Observable<any[]> = this._productionOrders.asObservable();
  getProductionQcId: Observable<any[]> = this._getProductionQcId.asObservable()
  cardbycode$: Observable<any[]> = this._cardByCode.asObservable();
  getProductionByQcCode: Observable<any[]> = this._getProductionByQcCode.asObservable()
  getProductionQcSampleId: Observable<any[]> = this._getProductionQcSampleId.asObservable()





  /**
     * Setter & getter for access token
     */
  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
}

get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
}

getProductionOrders(pageNumber: number, pageSize: number): Observable<any> {
  const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'X-API-KEY': 'super',
      Accept: 'application/json'
  });

  return this._httpClient
      .get(
          `${environment.appApiUrlSAP}/B1ProductionOrders/ListAllProductionOrders?pageNumber=${pageNumber}&pageSize=${pageSize}`,
          { headers }
      )
      .pipe(
          tap((response: any) => {
              const productionOrders = response?.data?.values ?? [];
              this._productionOrders.next(productionOrders);
              console.log('Fetched Production Orders:', productionOrders);
          }),
          catchError((error) => {
              console.error('Error fetching Production Orders', error);
              return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`));
          })
      );
}

getItemCode(itemCode: string): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accessToken}`,
    'Content-Type': 'application/json',
  });

  return this._httpClient.get(`${environment.appApiUrl}/CSAPI/IItemInspectionCardFeature/GetCardByCodeWithBothCharacteristics?itemCode=${itemCode}`,
      { headers }
  )
  .pipe(
      tap((response: any) => {
          const cardByCode = response?.data?.value ?? []
          this._cardByCode.next(cardByCode);
      }),
      catchError((error) => {
          console.error('Error fetching item code', error);
          return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`))
      })
  )
}

GetProductionQCId(itemCode: string, docNo: number, lineNo: number): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accessToken}`,
    'Content-Type': 'application/json',
      });
      
       return this._httpClient.get(
          `${environment.appApiUrl}/CSAPI/IProductionQCFeature/GetProductionQCId?itemCode=${itemCode}&docNumber=${docNo}&lineNo=${lineNo}`,
      { headers }
  )
  .pipe(
      tap((response: any) => {
          const getProductionByQcCode = response?.data?.value ?? []                
          this._getProductionByQcCode.next(getProductionByQcCode);
      }),
      catchError((error) => {
          console.error('Error fetching item code', error);
          return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`))
      })
  )

}

ListAllProductionQCSamplesByQcId(productionQcId: string) {
  const headers = new HttpHeaders({
   Authorization: `Bearer ${this.accessToken}`,
   'Content-Type': 'application/json',
   });
   
    return this._httpClient.get(
       `${environment.appApiUrl}/CSAPI/IProductionQCSampleFeature/ListAllProductionQCSamplesByQcId?productionQcId=${productionQcId}`,
   { headers }
)
.pipe(
   tap((response: any) => {
       const getProductionQcId = response?.data?.value ?? []                
       this._getProductionQcId.next(getProductionQcId);
   }),
   catchError((error) => {
       console.error('Error fetching item code', error);
       return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`))
   })
)
}

addProductionQcSample(data: any): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accessToken}`,
    'Content-Type': 'application/json',
  });

   return this._httpClient.post(
      `${environment.appApiUrl}/CSAPI/IProductionQCSampleFeature/AddProductionQCSample`,
      data,
      { headers }
  ).pipe(
      tap(response => console.log('RESPONSE:', response)),
      catchError(error => {
          console.error('Error adding qualitative result', error);
          return throwError(() => new Error('Error adding qualitative result'));
      })
  );
}

getProductionQcSampleById(productionQCSampleId: string) {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accessToken}`,
    Accept: 'application/json'
    });
    
     return this._httpClient.get(
        `${environment.appApiUrl}/CSAPI/IProductionQCSampleFeature/GetProductionQcSampleById?productionQCSampleId=${productionQCSampleId}`,
    { headers }
)
.pipe(
    tap((response: any) => {
        const getProductionQcSampleId = response?.data?.value ?? []                
        this._getProductionQcSampleId.next(getProductionQcSampleId);
    }),
    catchError((error) => {
        console.error('Error fetching item code', error);
        return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`))
    })
)
}
}
