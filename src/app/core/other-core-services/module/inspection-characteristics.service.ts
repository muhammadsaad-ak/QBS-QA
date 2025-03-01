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
export class InspectionCharacteristicsService {

  private _httpClient = inject(HttpClient);

  // BehaviorSubject to hold role data state
  private _inspectionCharacteristics = new BehaviorSubject<any[]>([]);
  private _inspectionCharacteristicsWithCriteria = new BehaviorSubject<any[]>([]);
  private _inspectionCharacteristicsCode = new BehaviorSubject<any[]>([]);


  // Observable to expose role data state
  itemcharacteristics$: Observable<any[]> = this._inspectionCharacteristics.asObservable(); // IC API
  inspectionCharacteristicsWithCriteria$: Observable<any[]> = this._inspectionCharacteristicsWithCriteria.asObservable(); // IC API
  inspectioncharacteristicsCode$: Observable<any[]> = this._inspectionCharacteristicsCode.asObservable(); //For IC Code API



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
  AddInspectionCharacteristics(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });
    return this._httpClient.post(
      `${environment.appApiUrl}/CSAPI/IInspectionCharacteristicFeature/AddCharacteristicWithCriteria`,
      data,
      { headers }
    ).pipe(
      tap(response => console.log('RESPONSE:', response)),
      catchError(error => {
        console.error('Error Adding Inspection Characteristics', error);
        return throwError(() => new Error('Error Adding Inspection Characteristics'));
      })
    );
  }

  getInspectionCharacteristicsCode(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'text/plain',
    });

    return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=inspection_characteristic`, { headers })
      .pipe(
        tap((inspectionCharacteristicCode) => {
          const inspectionCharacteristicsCode = (inspectionCharacteristicCode as any) ?? [];
          this._inspectionCharacteristicsCode.next(inspectionCharacteristicsCode);
          console.log('Fetched code of inspection Characteristics', inspectionCharacteristicsCode);
        }),
        catchError((error) => {
          console.error('Fetched code of inspection Characteristics', error);
          return throwError(
            () => new Error('Fetched code of inspection Characteristics')
          );
        })
      );
  }
  getInspectionCharacteristics(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'text/plain',
    });

    return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/IInspectionCharacteristicFeature/ListAllInspectionCharacteristics`, { headers })
      .pipe(
        tap((inspectionCharacteristic) => {
          const inspectionCharacteristics = (inspectionCharacteristic as any) ?? [];
          this._inspectionCharacteristics.next(inspectionCharacteristics);
          console.log('Fetched list of Inspection Characteristic', inspectionCharacteristics);
        }),
        catchError((error) => {
          console.error('Error fetching list of Inspection Characteristic', error);
          return throwError(
            () => new Error('Error fetching list of Inspection Characteristic')
          );
        })
      );
  }
  // LIST ALL INSPECTION CHARACTERISTICS WITH CRITERIA
  getInspectionWithCriteria(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'text/plain',
    });

    return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/IInspectionCharacteristicFeature/ListCharacteristicsWithCriteria`, { headers })
      .pipe(
        tap((characteristicsWithCriteria) => {
          const inspectionCharacteristicsWithCriteria = (characteristicsWithCriteria as any) ?? [];
          this._inspectionCharacteristicsWithCriteria.next(inspectionCharacteristicsWithCriteria);
          console.log('FETCHED LIST OF CHARACTERISTICS WITH CRITERIA', inspectionCharacteristicsWithCriteria);
        }),
        catchError((error) => {
          console.error('ERROR FETCHING LIST OF CHARACTERISTICS WITH CRITERIA', error);
          return throwError(
            () => new Error('ERROR FETCHING LIST OF CHARACTERISTICS WITH CRITERIA')
          );
        })
      );
  }
  // UPDATE  INSPECTION CHARACTERISTICS WITH CRITERIA
  updateInspectionWithCriteria(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });
    console.log("SENDING PAYLOAD", data);
    return this._httpClient.put(
      `${environment.appApiUrl}/CSAPI/IInspectionCharacteristicFeature/UpdateCharacteristic`,
      data,
      { headers }
    ).pipe(
      tap(response => console.log('RESPONSE:', response)),
      catchError(error => {
        console.error('ERROR WHILE UPDATING CHARACTERISTICS WITH CRITERIA', error);
        return throwError(() => error);
      })
    );
  }
}
