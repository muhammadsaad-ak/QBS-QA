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
export class ItemInspectionCardService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _listItemsInspectionCardsIIC = new BehaviorSubject<any[]>([]);
    private _listAllItemsIIC = new BehaviorSubject<any[]>([]);
    private _listInspectionCardsIIC = new BehaviorSubject<any[]>([]);
    private _listInspectionCharacteristics = new BehaviorSubject<any[]>([]);
    private _listCharacteristicsWithCriteria = new BehaviorSubject<any[]>([]);
    private _listUnitOfMeasureIIC = new BehaviorSubject<any[]>([]);
    private _listQualitativeResultsIIC = new BehaviorSubject<any[]>([]);
    private _bothCharacteristicsIIC = new BehaviorSubject<any[]>([]);


    // Observable to expose role data state
    listItemsInspectionCardsIIC$: Observable<any[]> = this._listItemsInspectionCardsIIC.asObservable();
    listAllItemsIIC$: Observable<any[]> = this._listAllItemsIIC.asObservable();
    listInspectionCardsIIC$: Observable<any[]> = this._listInspectionCardsIIC.asObservable();
    inspectionCardModal$: Observable<any[]> = this._listInspectionCharacteristics.asObservable();
    listCharacteristicsWithCriteria$: Observable<any[]> = this._listCharacteristicsWithCriteria.asObservable();
    listUnitOfMeasureIIC$: Observable<any[]> = this._listUnitOfMeasureIIC.asObservable();
    listQualitativeResultsIIC$: Observable<any[]> = this._listQualitativeResultsIIC.asObservable();
    bothCharacteristicsIIC$: Observable<any[]> = this._bothCharacteristicsIIC.asObservable();

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // ADD API
    // ADD ITEM INSPECTION CARD 3.1 API
    AddItemInspectionCard(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
        return this._httpClient.post(
            `${environment.appApiUrl}/CSAPI/IItemInspectionCardFeature/AddItemInspectionCardWithBothInspections`,
            data,
            { headers }
        ).pipe(
            tap(response => console.log('RESPONSE:', response)),
            catchError(error => {
                console.error('ERROR WHILE ADDING ITEM INSPECTION CARD', error);
                return throwError(() => error);
            })
        );
    }

    // GET ALL ITEM INSPECTION CARDS API
    ListAllItemsInspectionCards(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IItemInspectionCardFeature/ListAllCardsWithBothCharacteristics`, {
                headers,
            })
            .pipe(
                tap((results) => {
                    const itemsInspectionCards = (results as any).data ?? [];
                    this._listItemsInspectionCardsIIC.next(itemsInspectionCards);
                    console.log('FETCHED Item Inspection Card', itemsInspectionCards);
                }),
                catchError((error) => {
                    console.error('ERROR WHILE FETCHING Item Inspection Card', error);
                    return throwError(error);
                })
            );
    }
    // GET ALL SAP ITEMS API
    getListAllItems(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IItemCardFeature/ListAllItems`, {
                headers,
            })
            .pipe(
                tap((itemsSAP) => {
                    const listAllItemsSAP = (itemsSAP as any) ?? [];
                    this._listAllItemsIIC.next(listAllItemsSAP);
                    // console.log('FETCHED ITEMS:', listAllItemsSAP);
                }),
                catchError((error) => {
                    console.error('ERROR FETCHING ITEMS', error);
                    return throwError(error);
                })
            );
    }
    // GET ALL INSPECTION CARDS API
    ListAllInspectionCards(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IInspectionCardFeature/ListAllInspectionCards`, {
                headers,
            })
            .pipe(
                tap((itemsSAP) => {
                    const listAllPatchedCards = (itemsSAP as any) ?? [];
                    this._listInspectionCardsIIC.next(listAllPatchedCards);
                    console.log('FETCHED CARDS:', listAllPatchedCards);
                }),
                catchError((error) => {
                    console.error('ERROR FETCHING CARDS', error);
                    return throwError(error);
                })
            );
    }
    // GET CARD CHARACTERISTICS 
    getCardCharacteristicsDataByCardId(inspectionCardId): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        // const inspectionCardIdStatic = 'c5cfda17-7d45-4ad4-9a8f-963d12e7f9b2';
        const getItemDataByCodeapiUrl = `${environment.appApiUrl}/CSAPI/IInspectionCardFeature/GetCardByIdWithCharacteristicsWithCriteria?inspectionCardId=${inspectionCardId}`;

        console.log('Constructed API URL:', getItemDataByCodeapiUrl);
        console.log('Authorization Header:', headers.get('Authorization'));

        return this._httpClient.get(getItemDataByCodeapiUrl, { headers }).pipe(
            tap((listAllItemsSAP) => {
                // console.log('RECEIVED CHARACTERISTICS:', listAllItemsSAP);
            }),
            catchError((error) => {
                console.error('ERROR FETCHING CHARACTERISTICS', error);
                return throwError(error);
            })
        );
    }
    // LIST OF QUALITATIVE & QUANTITATIVE INSPECTION CHARACTERISTICS 
    getInspectionCharacteristicsIIC(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IInspectionCharacteristicFeature/ListAllInspectionCharacteristics`, { headers })
            .pipe(
                tap((inspectionCardsModal) => {
                    const inspectionCardModal = (inspectionCardsModal as any) ?? [];
                    this._listInspectionCharacteristics.next(inspectionCardModal);
                    // console.log('FETCHED INSPECTION CHARACTERISTICS', inspectionCardModal);
                }),
                catchError((error) => {
                    console.error('ERROR WHILE FETCHING LIST OF CHARACTERISTICS', error);
                    return throwError(error);
                })
            );
    }
    getInspectionCharacteristicsWithCriteria(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IInspectionCharacteristicFeature/ListCharacteristicsWithCriteria`, { headers })
            .pipe(
                tap((inspectionModalIIC) => {
                    const inspectionWithCriteria = (inspectionModalIIC as any) ?? [];
                    this._listCharacteristicsWithCriteria.next(inspectionWithCriteria);
                    // console.log('CHARACTERISTICS WITH CRITERIA', inspectionWithCriteria);
                }),
                catchError((error) => {
                    console.error('ERROR WHILE FETCHING LIST OF CHARACTERISTICS WITH CRITERIA', error);
                    return throwError(error);
                })
            );
    }
    // LIST ALL UNIT OF MEASURE
    getAllUnitOfMeasureIIC(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IUnitOfMeasureFeature/ListAllUnitOfMeasures`, { headers })
            .pipe(
                tap((uom) => {
                    const UnitOfMeasure = (uom as any) ?? [];
                    this._listUnitOfMeasureIIC.next(UnitOfMeasure);
                    // console.log('FETCHED UOM', UnitOfMeasure);
                }),
                catchError((error) => {
                    console.error('ERROR WHILE FETCHING LIST OF UOM', error);
                    return throwError(error);
                })
            );
    }
    // GET ALL QUALITATIVE RESULTS
    ListAllQualitativeResultsIIC(): Observable<any> {
        // Set up the headers with the Authorization token
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IQualitativeResultFeature/ListAllQualitativeResults`, {
                headers,
            })
            .pipe(
                tap((results) => {
                    // Optionally handle the response or state update here
                    const qualitativeResultsIIC = (results as any).data ?? [];
                    this._listQualitativeResultsIIC.next(qualitativeResultsIIC);
                    console.log('FETCHED QR', qualitativeResultsIIC);
                }),
                catchError((error) => {
                    console.error('ERROR WHILE QR', error);
                    return throwError(error);
                })
            );
    }
    // 
    getBothCharacteristicsByItemInspectionCard(itemInspectionCardId: string): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IItemInspectionCardFeature/GetCardByIdWithBothCharacteristics?itemInspectionCardId=${itemInspectionCardId}`, { headers })
            .pipe(
                tap((BothCharacteristicsIIC) => {
                    const IICBothCharacteristics = (BothCharacteristicsIIC as any) ?? [];
                    this._bothCharacteristicsIIC.next(IICBothCharacteristics);
                    console.log('FETCHED IIC BOTH CHARACTERISTICS', IICBothCharacteristics);
                }),
                catchError((error) => {
                    console.error('ERROR WHILE FETCHING LIST OF BOTH CHARACTERISTICS', error);
                    return throwError(error);
                })
            );
    }
    // UPDATE ITEM INSPECTION CARD
    onUpdateItemInspectionCardBothCharacteristics(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
        console.log('SENDING PAYLOAD', data);
        return this._httpClient
            .put(
                `${environment.appApiUrl}/CSAPI/IItemInspectionCardFeature/UpdateItemInspectionCard`,
                data,
                { headers }
            )
            .pipe(
                tap((response) => console.log('RESPONSE:', response)),
                catchError((error) => {
                    console.error(
                        'ERROR WHILE UPDATING ITEM INSPECTION CARD',
                        error
                    );
                    return throwError(() => error);
                })
            );
    }
}
