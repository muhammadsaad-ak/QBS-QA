import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

interface NextIntResponse {
    isApiHandled: boolean;
    isRequestSuccess: boolean;
    statusCode: number;
    message: string;
    data: number | null;
    exception: any[];
}

interface AddInspectionAttributeRequest {
    name: string;
    description: string;
    tag: string | null;
}

interface AddInspectionAttributeResponse {
    isApiHandled: boolean;
    isRequestSuccess: boolean;
    statusCode: number;
    message: string;
    data: boolean;
    exception: any[];
}

interface InspectionAttribute {
    id: string;
    intCode: number;
    name: string;
    description: string;
    tag: string | null;
    createdBy: string;
    updatedBy: string;
    createdDate: string;
    updatedDate: string;
    isActive: boolean;
    isArchived: boolean;
}

interface ListInspectionAttributesResponse {
    isApiHandled: boolean;
    isRequestSuccess: boolean;
    statusCode: number;
    message: string;
    data: InspectionAttribute[];
    exception: any[];
}

interface UpdateInspectionAttributeRequest {
    id: string;
    name: string;
    description: string;
    tag: string | null;
    isActive: boolean;
}

interface UpdateInspectionAttributeResponse {
    isApiHandled: boolean;
    isRequestSuccess: boolean;
    statusCode: number;
    message: string;
    data: boolean;
    exception: any[];
}

@Injectable({
    providedIn: 'root',
})

export class InspectionAttributesService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _nextIntCount = new BehaviorSubject<number | null>(null);
    private _listInspectionAttributes = new BehaviorSubject<InspectionAttribute[]>([]);

    // Observable to expose role data state
    nextIntCount$: Observable<number | null> = this._nextIntCount.asObservable();
    listInspectionAttributes$: Observable<InspectionAttribute[]> = this._listInspectionAttributes.asObservable();

    // Setter & getter for access token
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    // get accessToken(): string {
    //     return localStorage.getItem('accessToken') ?? '';
    // }

    // Get Next Int Count for inspection_attribute
    getNextIntCount(): Observable<NextIntResponse> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
            Accept: 'application/json',
        });
        return this._httpClient
            .get<NextIntResponse>(
                `${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=inspection_attribute`,
                { headers }
            )
            .pipe(
                tap((response) => {
                    if (response.isRequestSuccess && response.data !== null) {
                        this._nextIntCount.next(response.data);
                        console.log('FETCHED inspection_attribute nextIntCount:', response.data);
                    } else {
                        console.error('FAILED TO FETCH inspection_attribute nextIntCount:', response.message);
                    }
                }),
                catchError((error) => {
                    const apiMessage = error?.error?.message || error.message || 'Unknown error';
                    console.error('API RESPONSE MESSAGE:', apiMessage);
                    return throwError(() => new Error(apiMessage));
                })
            );
    }

    // Add Inspection Attribute
    addInspectionAttribute(data: AddInspectionAttributeRequest): Observable<AddInspectionAttributeResponse> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        });
        return this._httpClient
            .post<AddInspectionAttributeResponse>(
                `${environment.appApiUrl}/CSAPI/IInspectionAttributeFeature/AddInspectionAttribute`,
                data,
                { headers }
            )
            .pipe(
                tap((response) => {
                    if (response.isRequestSuccess && response.data === true) {
                        console.log('SUCCESSFULLY ADDED inspection_attribute:', response);
                    } else {
                        console.error('FAILED TO ADD inspection_attribute:', response.message);
                    }
                }),
                catchError((error) => {
                    const apiMessage = error?.error?.message || error.message || 'Unknown error';
                    console.error('API RESPONSE MESSAGE:', apiMessage);
                    return throwError(() => new Error(apiMessage));
                })
            );
    }

    // Get All Inspection Attributes
    ListAllInspectionAttributes(): Observable<ListInspectionAttributesResponse> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
            Accept: 'application/json',
        });
        return this._httpClient
            .get<ListInspectionAttributesResponse>(
                `${environment.appApiUrl}/CSAPI/IInspectionAttributeFeature/ListAllInspectionAttributes`,
                { headers }
            )
            .pipe(
                tap((response) => {
                    if (response.isRequestSuccess && response.data) {
                        this._listInspectionAttributes.next(response.data);
                        console.log('FETCHED inspection_attributes:', response.data);
                    } else {
                        console.error('FAILED TO FETCH inspection_attributes:', response.message);
                    }
                }),
                catchError((error) => {
                    const apiMessage = error?.error?.message || error.message || 'Unknown error';
                    console.error('API RESPONSE MESSAGE:', apiMessage);
                    return throwError(() => new Error(apiMessage));
                })
            );
    }

    // Update Inspection Attribute
    updateInspectionAttribute(data: UpdateInspectionAttributeRequest): Observable<UpdateInspectionAttributeResponse> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        });
        return this._httpClient
            .put<UpdateInspectionAttributeResponse>(
                `${environment.appApiUrl}/CSAPI/IInspectionAttributeFeature/UpdateInspectionAttribute`,
                data,
                { headers }
            )
            .pipe(
                tap((response) => {
                    if (response.isRequestSuccess && response.data === true) {
                        console.log('SUCCESSFULLY UPDATED inspection_attribute:', response);
                    } else {
                        console.error('FAILED TO UPDATE inspection_attribute:', response.message);
                    }
                }),
                catchError((error) => {
                    const apiMessage = error?.error?.message || error.message || 'Unknown error';
                    console.error('API RESPONSE MESSAGE:', apiMessage);
                    return throwError(() => new Error(apiMessage));
                })
            );
    }
}