import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, of, switchMap, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluationPlanQaOrderService {

  constructor(private _httpClient: HttpClient) { }

    private _qaProductionCode = new BehaviorSubject<any[]>([]);
    private _listEvaluationPlanProductionOrdersQA = new BehaviorSubject<any[]>([]);
    


    qaProductionCode$: Observable<any[]> = this._qaProductionCode.asObservable();
    listEvaluationPlanProductionOrdersQA$: Observable<any[]> = this._listEvaluationPlanProductionOrdersQA.asObservable();
    


  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

    getProductionQACode(): Observable<any> {
      const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'text/plain',
      });
  
      return this._httpClient
          .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=production_qa`, { headers })
          .pipe(
              tap((productionQACode) => {
                  const productionQAResultsCode = (productionQACode as any) ?? [];
                  this._qaProductionCode.next(productionQAResultsCode);
                  console.log('Fetched code for Production QA:', productionQAResultsCode);
              }),
              catchError((error) => {
                  console.error('Error fetching Production QA Code:', error);
                  return throwError(() => new Error('Error fetching Prodcution QA Code'));
              })
          );
  }

  getEvaluationPlanProductionOrdersQA(): Observable<any> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
    });

    return this._httpClient.get(`${environment.appApiUrl}/CSAPI/IProductionQAFeature/ListAllProductionQAsWithItem`, { headers })
        .pipe(
            tap((response: any) => {
                console.log('API Response:', response);
                this._listEvaluationPlanProductionOrdersQA.next(response);
            }),
            catchError((error) => {
                console.error('Error fetching Evaluation Plan Production QA Orders', error);
                return throwError(() => new Error('Error fetching Evaluation Plan Production QA Orders'));
            })
        );
}

addProductionQA(data: any): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accessToken}`,
    'Content-Type': 'application/json',
  });

   return this._httpClient.post(
      `${environment.appApiUrl}/CSAPI/IProductionQAFeature/AddProductionQA`,
      data,
      { headers }
  ).pipe(
      tap(response => console.log('RESPONSE:', response)),
      catchError(error => {
          console.error('Error adding prod result', error);
          return throwError(() => new Error('Error adding qualitative result'));
      })
  );
}
}
