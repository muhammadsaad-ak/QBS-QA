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
}