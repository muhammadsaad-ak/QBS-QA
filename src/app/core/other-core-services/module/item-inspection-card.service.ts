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
    private _listItemsInspectionCards = new BehaviorSubject<any[]>([]);
    private _listAllItems = new BehaviorSubject<any[]>([]);
    private _listInspectionCards = new BehaviorSubject<any[]>([]);

    // Observable to expose role data state
    listItemsInspectionCards$: Observable<any[]> = this._listItemsInspectionCards.asObservable();
    listAllItems$: Observable<any[]> = this._listAllItems.asObservable();
    listInspectionCards$: Observable<any[]> = this._listInspectionCards.asObservable();

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
    // GET ALL ITEM INSPECTION CARDS API
    ListAllItemsInspectionCards(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IItemInspectionCardFeature/ListAllItemInspectionCards`, {
                headers,
            })
            .pipe(
                tap((results) => {
                    const itemsInspectionCards = (results as any).data ?? [];
                    this._listItemsInspectionCards.next(itemsInspectionCards);
                    console.log('FETCHED RESULTS', itemsInspectionCards);
                }),
                catchError((error) => {
                    console.error('ERROR FETCHING ITEM SAMPLES', error);
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
                    this._listAllItems.next(listAllItemsSAP);
                    console.log('FETCHED ITEMS:', listAllItemsSAP);
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
                    this._listInspectionCards.next(listAllPatchedCards);
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
                console.log('FETCHED ITEM DATA:', listAllItemsSAP);
            }),
            catchError((error) => {
                console.error('ERROR FETCHING ITEM DATA', error);
                return throwError(error);
            })
        );
    }
}