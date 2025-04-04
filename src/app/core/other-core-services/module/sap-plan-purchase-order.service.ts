import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SapPlanPurchaseOrderService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    // private _UnitOfMeasure = new BehaviorSubject<any[]>([]);
    private _purchaseOrders = new BehaviorSubject<any[]>([]);
    private _productionOrders = new BehaviorSubject<any[]>([]);
    private _cardByCode = new BehaviorSubject<any[]>([])
    private _getPurchaseByQcCode = new BehaviorSubject<any[]>([])
    private _getPurchaseQcId = new BehaviorSubject<any[]>([])
    private _getProductionQcId = new BehaviorSubject<any[]>([])
    // Observable to expose role data state
    // unitofmeasure$: Observable<any[]> = this._UnitOfMeasure.asObservable();
    sappurchaseorder$: Observable<any[]> = this._purchaseOrders.asObservable();
    sapproductionorder$: Observable<any[]> = this._productionOrders.asObservable();
    cardbycode$: Observable<any[]> = this._cardByCode.asObservable();
    getPurchaseByQcCode: Observable<any[]> = this._getPurchaseByQcCode.asObservable()
    getPurchaseQcId: Observable<any[]> = this._getPurchaseQcId.asObservable()
    getProductionQcId: Observable<any[]> = this._getProductionQcId.asObservable()
    
    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    getPurchaseOrders(pageNumber: number, pageSize: number): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'X-API-KEY': 'super',  // Ensure you pass API key if required
            Accept: 'application/json'
        });
        return this._httpClient
            .get(
                `${environment.appApiUrlSAP}/B1PurchaseOrders/ListAllPurchaseOrders?pageNumber=${pageNumber}&pageSize=${pageSize}`,
                { headers }
            )
            .pipe(
                tap((response: any) => {
                    const purchaseOrders = response?.data?.values ?? [];
                    this._purchaseOrders.next(purchaseOrders);
                    console.log('Fetched Purchase Orders:', purchaseOrders);
                }),
                catchError((error) => {
                    console.error('Error fetching Purchase Orders', error);
                    return throwError(
                        () =>
                            new Error(
                                `Error fetching Purchase Orders: ${error.message}`
                            )
                    );
                })
            );
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
            'X-API-KEY': 'super',
            Accept: 'application/json'
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

    addPurchaseQcSample(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'X-API-KEY': 'super',  // Ensure you pass API key if required
            Accept: 'application/json'
        });

         return this._httpClient.post(
            `${environment.appApiUrl}/CSAPI/IPurchaseQCSampleFeature/AddPurchaseQCSample`,
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

    GetPurchaseQCId(itemCode: string, docNo: number, lineNo: number): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'X-API-KEY': 'super',
            Accept: 'application/json'
            });
            
             return this._httpClient.get(
                `${environment.appApiUrl}/CSAPI/IPurchaseQCFeature/GetPurchaseQCId?itemCode=${itemCode}&docNumber=${docNo}&lineNo=${lineNo}`,
            { headers }
        )
        .pipe(
            tap((response: any) => {
                const getPurchaseByQcCode = response?.data?.value ?? []                
                this._getPurchaseByQcCode.next(getPurchaseByQcCode);
            }),
            catchError((error) => {
                console.error('Error fetching item code', error);
                return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`))
            })
        )

    }


   
ListAllPurchaseQCSamplesByQcId(purchaseQcId: string) {
           const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'X-API-KEY': 'super',
            Accept: 'application/json'
            });
            
             return this._httpClient.get(
                `${environment.appApiUrl}/CSAPI/IPurchaseQCSampleFeature/ListAllPurchaseQCSamplesByQcId?purchaseQcId=${purchaseQcId}`,
            { headers }
        )
        .pipe(
            tap((response: any) => {
                const getPurchaseQcId = response?.data?.value ?? []                
                this._getPurchaseQcId.next(getPurchaseQcId);
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
         'X-API-KEY': 'super',
         Accept: 'application/json'
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
 
}
    

