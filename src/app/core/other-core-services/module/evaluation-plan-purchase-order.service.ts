import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import {BehaviorSubject,Observable,catchError,of,switchMap,tap,throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluationPlanPurchaseOrderService {
  private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _listQualitativeResults = new BehaviorSubject<any[]>([]);

    // Observable to expose role data state
    listQualitativeResults$: Observable<any[]> = this._listQualitativeResults.asObservable();


    
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
}
