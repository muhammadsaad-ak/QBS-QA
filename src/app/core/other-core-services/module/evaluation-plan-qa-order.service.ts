import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, of, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluationPlanQaOrderService {

  constructor(private _httpClient: HttpClient) { }

    private _qcPurchaseCode = new BehaviorSubject<any[]>([]);
    qcPurchaseCode$: Observable<any[]> = this._qcPurchaseCode.asObservable();

  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
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
                  this._qcPurchaseCode.next(productionQCResultsCode);
                  console.log('Fetched code for Production QC:', productionQCResultsCode);
              }),
              catchError((error) => {
                  console.error('Error fetching Production QC Code:', error);
                  return throwError(() => new Error('Error fetching Prodcution QC Code'));
              })
          );
  }
}
