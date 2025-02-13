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
  private _inspectionCardModal = new BehaviorSubject<any[]>([]);
  private _inspectionCardsCode = new BehaviorSubject<any[]>([]);
  private _inspectionCard = new BehaviorSubject<any[]>([]);



  // Observable to expose role data state
  inspectionCardModal$: Observable<any[]> = this._inspectionCardModal.asObservable(); // IC API
  inspectionCardCode$: Observable<any[]> = this._inspectionCardsCode.asObservable(); //For IC Code API
  inspectioncard$: Observable<any[]> = this._inspectionCard.asObservable(); // IC API



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


  //Inspection Card Code API
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

//Inspection Card Modal API

getInspectionCardModal(): Observable<any> {
  const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'text/plain',
  });

  return this._httpClient
      .get(`${environment.appApiUrl}/CSAPI/IInspectionCharacteristicFeature/ListAllInspectionCharacteristics`, { headers })
      .pipe(
          tap((inspectionCardsModal) => {
              const inspectionCardModal = (inspectionCardsModal as any) ?? [];
              this._inspectionCardModal.next(inspectionCardModal);
              console.log('Fetched list of Inspection Card Modal', inspectionCardModal);
          }),
          catchError((error) => {
              console.error('Fetched list of Inspection Card Modal', error);
              return throwError(
                  () => new Error('Fetched list of Inspection Card Modal')
              );
            })
          );
  }

  getInspectionCard(): Observable<any> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'text/plain',
    });

    return this._httpClient
        .get(`${environment.appApiUrl}/CSAPI/IInspectionCardFeature/ListAllInspectionCards`, { headers })
        .pipe(
            tap((inspectionCard) => {
                const inspectionCards = (inspectionCard as any) ?? [];
                this._inspectionCard.next(inspectionCards);
                console.log('Fetched list of Inspection Card', inspectionCards);
            }),
            catchError((error) => {
                console.error('Fetched list of Inspection Card', error);
                return throwError(
                    () => new Error('Fetched list of Inspection Card')
                );
              })
            );
    }

//   AddInspectionCard(data: any): Observable<any> {
//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${this.accessToken}`,
//       'Content-Type': 'application/json',
//   });
//   return this._httpClient.post(
//       `${environment.appApiUrl}/CSAPI/IInspectionCardFeature/AddInspectionCardWithCharacteristics`,
//       data,
//       { headers }
//   ).pipe(
//       tap(response => console.log('RESPONSE:', response)),
//       catchError(error => {
//           console.error('Error Adding Inspection Cards', error);
//           return throwError(() => new Error('Error Adding Inspection Cards'));
//       })
//   );
// }

}
