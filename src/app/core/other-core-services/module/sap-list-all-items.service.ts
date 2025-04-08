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

export class SAPItemsService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _listAllItemsSAP = new BehaviorSubject<any[]>([]);

    // Observable to expose role data state
    listAllItemsSAP$: Observable<any[]> = this._listAllItemsSAP.asObservable();

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }
    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // GET LIST ALL ITEMS API
    getListAllItemsSAP(pageSize: number, pageNumber: number): Observable<any> {
        if (this.accessToken.length > 0) {
            this.accessToken = '';
        }
        const headers = new HttpHeaders({
            // Authorization: `${this.accessToken}`,
            Accept: 'text/plain',
            'X-API-KEY': 'super',
        });
        return this._httpClient
            .get(`${environment.SAPitemsApiUrl}/api/B1Items/ListAllItems?pageSize=${pageSize}&pageNumber=${pageNumber}`, { headers, responseType: 'text' })
            .pipe(
                tap((itemsSAP) => {
                    // console.log('FETCHED SAP LIST ALL ITEMS:', itemsSAP);
                    this._listAllItemsSAP.next(itemsSAP ? JSON.parse(itemsSAP) : []);
                }),
                catchError((error) => {
                    console.error('ERROR WHILE FETCHING SAP LIST ALL ITEMS', error);
                    return throwError(error);
                })
            );
    }

    // GET SAP ITEMS AGAINST ITEM CODE OR AGAINST ITEM NAME
    getSearchedSapItems(itemCode: string): Observable<any> {
        const headers = new HttpHeaders({
            Accept: 'text/plain',
            'X-API-KEY': 'super',
        });
        return this._httpClient.get(
            `${environment.SAPitemsApiUrl}/api/B1Items/GetItemByCode?itemCode=${itemCode}`,
            { headers, responseType: 'text' }
        );
    }

    // POST API TO ENABLE ITEM IN SAP FOR QA
    enableItemForQA(itemCode: string): Observable<any> {
        const headers = new HttpHeaders({
            'Accept': 'application/json', // Changed to match response content-type
            'X-API-KEY': 'super'
        });
        return this._httpClient.post(
            `${environment.SAPitemsApiUrl}/api/B1Items/EnableItemForQA?itemCode=${itemCode}`,
            '',
            { headers }
        ).pipe(
            tap((response: any) => {
                if (response.succeeded) {
                    console.log('ITEM ENABLED FOR QA SUCCESSFULLY:', response);
                } else {
                    console.warn('ITEM ENABLING FAILED:', response.message);
                }
            }),
            catchError((error) => {
                console.error('HTTP ERROR WHILE ENABLING ITEM FOR QA', error);
                return throwError(() => error);
            })
        );
    }
}
