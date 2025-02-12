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
export class QualitativeResultsService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _listQualitativeResults  = new BehaviorSubject<any[]>([]);

    // Observable to expose role data state
    listQualitativeResults$: Observable<any[]> = this._listQualitativeResults .asObservable();

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // ADD QUALITATIVE RESULT API
    AddQualitativeResult(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
        return this._httpClient.post(
            `${environment.appApiUrl}/CSAPI/IQualitativeResultFeature/AddQualitativeResult`,
            data,
            { headers }
        ).pipe(
            tap(response => console.log('RESPONSE:', response)),
            catchError(error => {
                console.error('Error adding qualitative result', error);
                return throwError(() => new Error('Error adding qualitative result'));
            })
        );
    }
    // GET ALL QUALITATIVE RESULTS
    ListAllQualitativeResults(): Observable<any> {
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
                    const qualitativeResults = (results as any).data ?? [];
                    this._listQualitativeResults .next(qualitativeResults);
                      console.log('FETCHED RESULTS', qualitativeResults);
                }),
                catchError((error) => {
                    console.error('Error fetching items', error);
                    return throwError(
                        () => new Error('Error fetching items')
                    );
                })
            );
    }
}