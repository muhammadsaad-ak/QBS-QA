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

    // Observable to expose role data state
    // unitofmeasure$: Observable<any[]> = this._UnitOfMeasure.asObservable();
    sappurchaseorder$: Observable<any[]> = this._purchaseOrders.asObservable();

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
}
