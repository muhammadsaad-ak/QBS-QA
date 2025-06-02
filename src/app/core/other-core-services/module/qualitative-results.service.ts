import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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

interface NextIntResponse {
    nextInt: number;
}

@Injectable({
    providedIn: 'root',
})
export class QualitativeResultsService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _listQualitativeResults = new BehaviorSubject<any[]>([]);
    private _qualityResultsCode = new BehaviorSubject<any[]>([]);
    private _inspectionAttributesNextIntCode = new BehaviorSubject<any[]>([]);
    private _listinspectionAttributes = new BehaviorSubject<any[]>([]);


    // Observable to expose role data state
    listQualitativeResults$: Observable<any[]> = this._listQualitativeResults.asObservable();
    listinspectionAttributes$: Observable<any[]> = this._listinspectionAttributes.asObservable();

    qualityResultCode$: Observable<any[]> = this._qualityResultsCode.asObservable(); //For IC Code API
    inspectionAttributesNextIntCode$: Observable<any[]> = this._inspectionAttributesNextIntCode.asObservable();


    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    // get accessToken(): string {
    //     return localStorage.getItem('accessToken') ?? '';
    // }

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
                console.error('ERROR ADDING QUALITATIVE RESULT', error);
                return throwError(() => error);
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
                    this._listQualitativeResults.next(qualitativeResults);
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

    //  GET NEXT INT COUNT QUALITATIVE RESULT
    getQualitativeResultCode(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=qualitative_result`, { headers })
            .pipe(
                tap((qualityResultCode) => {
                    const qualityResultsCode = (qualityResultCode as any) ?? [];
                    this._qualityResultsCode.next(qualityResultsCode);
                    console.log('Fetched code of Quality Result Code', qualityResultsCode);
                }),
                catchError((error) => {
                    console.error('Fetched code of Quality Result Code', error);
                    return throwError(
                        () => new Error('Fetched code of Quality Result Code')
                    );
                })
            );
    }
    // UPDATE QUALITATIVE RESULT API
    UpdateQualitativeResult(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
        // console.log("SENDING PAYLOAD", data);
        return this._httpClient.put(
            `${environment.appApiUrl}/CSAPI/IQualitativeResultFeature/UpdateQualitativeResult`,
            data,
            { headers }
        ).pipe(
            tap(response => console.log('RESPONSE:', response)),
            catchError(error => {
                console.error('ERROR WHILE UPDATING QUALITATIVE RESULT', error);
                return throwError(() => error);
            })
        );
    }
        //  GET NEXT INT COUNT QUALITATIVE RESULT
    getInspectionAttributesNextIntCount(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=inspection_attribute`, { headers })
            .pipe(
                tap((InspectionAttributesNextInt) => {
                    const nextIntCodeInspectionAttribute = (InspectionAttributesNextInt as any) ?? [];
                    this._inspectionAttributesNextIntCode.next(nextIntCodeInspectionAttribute);
                    // console.log('API RESPONSE', nextIntCodeInspectionAttribute);
                    console.log('FETCHECD inspection_attribute NextIntCount', nextIntCodeInspectionAttribute.data);
                }),
                catchError((error) => {
                    const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
                    return throwError(() => new Error(`FAILED TO FETCH inspection_attribute NextIntCount: ${errorMessage}`));
                })
            );
    }

        AddInspectionAttributes(data: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
        return this._httpClient.post(
            `${environment.appApiUrl}/CSAPI/IInspectionAttributeFeature/AddInspectionAttribute`,
            data,
            { headers }
        ).pipe(
            tap(response => console.log('RESPONSE:', response)),
            catchError(error => {
                console.error('ERROR ADDING AddInspectionAttributes', error);
                return throwError(() => error);
            })
        );
    }

    ListAllInspectionAttributes(): Observable<any> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
    });

    return this._httpClient
        .get(`${environment.appApiUrl}/CSAPI/IInspectionAttributeFeature/ListAllInspectionAttributes`, {
            headers,
        })
        .pipe(
            tap((response: any) => {
                const attributes = response?.data ?? [];
                this._inspectionAttributesNextIntCode.next(attributes);
                console.log('Fetched Attributes:', attributes);
            }),
            catchError((error) => {
                console.error('Error fetching inspection attributes', error);
                return throwError(() => new Error('Error fetching inspection attributes'));
            })
        );
}


}