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
export class ItemSamplesService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _listItemSamples = new BehaviorSubject<any[]>([]);
    private _listAllItems = new BehaviorSubject<any[]>([]);
    private _sampleCodeIS = new BehaviorSubject<any[]>([]);
    private _listSamplingRange = new BehaviorSubject<any[]>([]);

    // Observable to expose role data state
    listItemSamples$: Observable<any[]> = this._listItemSamples.asObservable();
    listAllItems$: Observable<any[]> = this._listAllItems.asObservable();
    sampleCodeIS$: Observable<any[]> = this._sampleCodeIS.asObservable();
    listSamplingRange$: Observable<any[]> = this._listSamplingRange.asObservable();

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // ADD ITEM SAMPLE API
    AddSampleWithRanges(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
        return this._httpClient.post(
            `${environment.appApiUrl}/CSAPI/IItemSampleFeature/AddSampleWithRanges`,
            data,
            { headers }
        ).pipe(
            tap(response => console.log('RESPONSE:', response)),
            catchError(error => {
                console.error('ERROR WHILE ADDING DATA', error);
                return throwError(() => error);
            })
        );
    }
    // GET ALL ITEM SAMPLE API
    ListAllItemSamples(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IItemSampleFeature/ListAllItemSamplesWithItems`, {
                headers,
            })
            .pipe(
                tap((results) => {
                    const itemSamples = (results as any).data ?? [];
                    this._listItemSamples.next(itemSamples);
                    console.log('FETCHED RESULTS', itemSamples);
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
                    console.error('ERROR FETCHING RESULT', error);
                    return throwError(error);
                })
            );
    }
    //  GET NEXT INT COUNT
    getSampleCodeIS(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=item_sample`, { headers })
            .pipe(
                tap((sampleCodeIS) => {
                    const sampleIntCodeIS = (sampleCodeIS as any) ?? [];
                    this._sampleCodeIS.next(sampleIntCodeIS);
                    console.log('FETCHED NEXTINTCOUNT OF ITEM SAMPLE', sampleIntCodeIS);
                }),
                catchError((error) => {
                    console.error('ERROR FETCHING NextIntCount', error);
                    return throwError(error);
                })
            );
    }
    // GET ITEM SAMPLE API
    getSamplingRangeObjectsBySampleId(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IItemSampleFeature/ListRangesBySampleId?sampleId=98aa1321-60f4-4816-8ce8-dba49348730e`, {
                headers,
            })
            .pipe(
                tap((results) => {
                    const samplingRange = (results as any).data ?? [];
                    this._listSamplingRange.next(samplingRange);
                    console.log('FETCHED SAMPLE RANGE', samplingRange);
                }),
                catchError((error) => {
                    console.error('ERROR FETCHING SAMPLE RANGE', error);
                    return throwError(error);
                })
            );
    }
    // GET SAMPLING RANGE API
    getSamplingRangeObjects(sampleId: string): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IItemSampleFeature/ListRangesBySampleId?sampleId=${sampleId}`, {
                headers,
            })
            .pipe(
                tap((results) => {
                    console.log('FETCHED SAMPLING RANGE OBJECTS', results);
                }),
                catchError((error) => {
                    console.error('ERROR FETCHING SAMPLING RANGE OBJECTS', error);
                    return throwError(error);
                })
            );
    }
    // UPDATE  ITEM SAMPLE
    updateItemSample(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
        console.log("SENDING PAYLOAD", data);
        return this._httpClient.put(
            `${environment.appApiUrl}/CSAPI/IItemSampleFeature/UpdateItemSample`,
            data,
            { headers }
        ).pipe(
            tap(response => console.log('RESPONSE:', response)),
            catchError(error => {
                console.error('ERROR WHILE UPDATING ITEM SAMPLE', error);
                return throwError(() => error);
            })
        );
    }
}