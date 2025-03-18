import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import {BehaviorSubject,Observable,catchError,of,switchMap,tap,throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListOfEvaluationPlanPurchaseOrderService {
  private _httpClient = inject(HttpClient);

  
  private _listEvaluationPlanPurchaseOrders = new BehaviorSubject<any[]>([]);
  listEvaluationPlanPurchaseOrders$: Observable<any[]> = this._listEvaluationPlanPurchaseOrders.asObservable();
  
        /**
     * Setter & getter for access token
     */
        set accessToken(token: string) {
          localStorage.setItem('accessToken', token);
      }
    
      get accessToken(): string {
          return localStorage.getItem('accessToken') ?? '';
      }
    
      getEvaluationPlanPurchaseOrders(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'application/json',
        });
    
        return this._httpClient.get(`${environment.appApiUrl}/CSAPI/IPurchaseQCFeature/ListAllPurchaseQCsWithItem`, { headers })
            .pipe(
                tap((response: any) => {
                    console.log('API Response:', response);
                    this._listEvaluationPlanPurchaseOrders.next(response);
                }),
                catchError((error) => {
                    console.error('Error fetching Evaluation Plan Purchase Orders', error);
                    return throwError(() => new Error('Error fetching Evaluation Plan Purchase Orders'));
                })
            );
    }}
