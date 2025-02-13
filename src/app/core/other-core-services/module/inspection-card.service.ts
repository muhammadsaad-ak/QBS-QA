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
  providedIn: 'root'
})
export class InspectionCardService {
  private _httpClient = inject(HttpClient);

  // BehaviorSubject to hold role data state
  // private _inspectionCharacteristics = new BehaviorSubject<any[]>([]);
  private _inspectionCardsCode = new BehaviorSubject<any[]>([]);


  // Observable to expose role data state
  // itemcharacteristics$: Observable<any[]> = this._inspectionCharacteristics.asObservable(); // IC API
  inspectioncharacteristicsCode$: Observable<any[]> = this._inspectionCardsCode.asObservable(); //For IC Code API


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
  // constructor() { }

  getInspectionCardCode(): Observable<any> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'text/plain',
    });
  
    return this._httpClient
        .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=inspection_card`, { headers })
        .pipe(
            tap((inspectionCardCode) => {
                const inspectionCardsCode = (inspectionCardCode as any) ?? [];
                this._inspectionCardsCode.next(inspectionCardsCode);
                console.log('Fetched code of Inspection Code', inspectionCardsCode);
            }),
            catchError((error) => {
                console.error('Fetched code of Inspection Code', error);
                return throwError(
                    () => new Error('Fetched code of Inspection Code')
                );
              })
            );
    }
}
