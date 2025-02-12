import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import {
    BehaviorSubject,
    Observable,
    catchError,
    of,
    switchMap,
    tap,
    throwError,
} from 'rxjs';


@Injectable({
    providedIn: 'root',
})
export class UomMasterService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _UnitOfMeasure = new BehaviorSubject<any[]>([]);

    // Observable to expose role data state
    unitofmeasure$: Observable<any[]> = this._UnitOfMeasure.asObservable();

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Fetch the list of items and store in state
     *
     * @returns Observable of items
     */
    AddUnitOfMeasure(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
        return this._httpClient.post(
            `${environment.appApiUrl}/CSAPI/IUnitOfMeasureFeature/AddUnitOfMeasure`,
            data,
            { headers }
        ).pipe(
            tap(response => console.log('RESPONSE:', response)),
            catchError(error => {
                console.error('Error adding UnitOfMeasure', error);
                return throwError(() => new Error('Error adding UnitOfMeasure'));
            })
        );
    }

    getUnitOfMeasure(): Observable<any> {
      const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'text/plain',
      });

      return this._httpClient
          .get(`${environment.appApiUrl}/CSAPI/IUnitOfMeasureFeature/ListAllUnitOfMeasures`, { headers })
          .pipe(
              tap((uom) => {
                  const UnitOfMeasure = (uom as any) ?? [];
                  this._UnitOfMeasure.next(UnitOfMeasure);
                  console.log('Fetched list of UOM', UnitOfMeasure);
              }),
              catchError((error) => {
                  console.error('Error fetching list of UOM', error);
                  return throwError(
                      () => new Error('Error fetching list of UOM')
                  );
                })
              );
      }}
