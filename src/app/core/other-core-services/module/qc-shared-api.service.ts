import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'environments/environment';

// INTERFACES
export interface ApiResponse<T> {
    isApiHandled: boolean;
    isRequestSuccess: boolean;
    statusCode: number;
    message: string;
    data: T;
    exception: any[];
}
// getItemByCode
export interface Item {
    id: string;
    intCode: number;
    itemCode: string;
    name: string;
    type: string;
    groupCode: string;
    groupName: string;
    isBatch: boolean;
    isActive: boolean;
    isArchived: boolean;
    createdDate: string;
    updatedDate: string;
    [key: string]: any;
}
// GetIncomingQcReferenceCode 
export interface QcLotNoResponse {
    qcLotNo: string;
    plantName: string;
    warehouseCode: string;
    docNo: string;
    docDate: string;
    [key: string]: any;
}
// IQualityCommonFeature/GetQualityStatus
export interface QualityStatusInterface {
    isPerformed: boolean;
    isPostedToSap: boolean;
    isClosed: boolean;
    overallStatus: boolean | null;
    evaluationStatus: string | null;
}

@Injectable({
    providedIn: 'root',
})

export class QcSharedApiService {
    private baseUrl = `${environment.appApiUrl}/CSAPI`;

    constructor(private http: HttpClient) { }

    // GetItemByCode
    getItemByCode(itemCode: string): Observable<Item[]> {
        return this.http
            .get<ApiResponse<Item[]>>(
                `${this.baseUrl}/IItemCardFeature/GetItemByCode?itemCode=${itemCode}`
            )
            .pipe(
                map((res) => {
                    if (!res.isRequestSuccess || !res.data) {
                        throw new Error(res.message || `No records found against item code: ${itemCode}`);
                    }
                    return res.data;
                }),
                catchError((err) => {
                    // message FROM THE API RESPONSE",
                    if (err.error?.message) {
                        // return throwError(() => new Error(err.error.message));
                        return throwError(() => new Error(err.error.message + ` against item code: ${itemCode}. Open item first.`));
                    }
                    // GENERIC ERROR MESSAGE
                    return throwError(() => new Error(`No records found against item code: ${itemCode}`));
                })
                // catchError(this.handleError('getItemByCode'))
            );
    }
    // GetIncomingQcReferenceCode
    getQcLotNo(itemCode: string, plantName: string, docNo: string, docDate: string, warehouseCode: string): Observable<QcLotNoResponse> {

        const params = new HttpParams()
            .set('itemCode', itemCode)
            .set('plantName', plantName)
            .set('docNo', docNo)
            .set('docDate', docDate)
            .set('warehouseCode', warehouseCode);

        return this.http
            .get<ApiResponse<any>>(
                `${this.baseUrl}/IIncomingQCFeature/GetIncomingQcReferenceCode`,
                { params }
            )
            .pipe(
                map((res) => {
                    if (!res.isRequestSuccess || !res.data) {
                        // throw new Error(res.message || 'No records found against the given details.');
                        return throwError(() => new Error(res.message || `No records found against item code: ${itemCode}`));
                    }
                    return res.data;
                }),
                catchError((err) => {
                    if (err.error && err.error.message) {
                        return throwError(() => new Error(err.error.message));
                    }
                    // return throwError(() => new Error('No records found against the given details.'));
                    let message = 'No records found against the given details.';
                    if (err.status === 404) {
                        message = 'No QC Lot No found against the given parameters.';
                    } else if (err.status === 400) {
                        message = 'Invalid request. Please verify the input details.';
                    } else if (err.error?.message) {
                        message = err.error.message;
                    }
                    return throwError(() => new Error(message));
                })
            );
    }

    // NextIntCode by entityName
    getNextIntCode(entityName: string): Observable<number> {
        return this.http
            .get<ApiResponse<number>>(
                `${this.baseUrl}/INextIntCodeFeature/GetNextIntCount?entityName=${entityName}`
            )
            .pipe(
                map((res) => {
                    if (!res.isRequestSuccess) {
                        throw new Error(res.message || 'Failed to fetch code');
                    }
                    return res.data ?? 0;
                }),
                catchError((err) => {
                    console.error(`Error fetching code for entityName=${entityName}:`, err);
                    const apiMsg = err?.error?.message || 'Error fetching code';
                    return throwError(() => new Error(apiMsg));
                })
            );
    }
    // incoming_qc
    getIncomingQcQCode(): Observable<number> {
        return this.getNextIntCode('incoming_qc');
    }
    // purchase_qc
    getPurchaseQcQCode(): Observable<number> {
        return this.getNextIntCode('purchase_qc');
    }
    private handleError(context: string) {
        return (err: any) => {
            console.error(`Error in ${context}:`, err);
            const msg =
                err?.error?.message ||
                err?.message ||
                'Unexpected error occurred';
            return throwError(() => new Error(msg));
        };
    }
    // GetQualityStatus
    getQualityStatus(
        entityName: string,
        itemCode: string,
        docNumber: string
    ): Observable<ApiResponse<QualityStatusInterface>> {
        const params = new HttpParams()
            .set('entityName', entityName)
            .set('itemCode', itemCode)
            .set('docNumber', docNumber);

        return this.http
            .get<ApiResponse<QualityStatusInterface>>(
                `${this.baseUrl}/IQualityCommonFeature/GetQualityStatus`,
                { params }
            )
            .pipe(
                map((res) => {
                    // console.log('FETCHED Q-STATUS RESPONSE', res.data);
                    return res;
                }),
                catchError((err) => {
                    console.error('Error fetching quality status:', err);
                    const apiMsg =
                        err?.error?.message || err?.message || 'Error fetching quality status.';
                    return throwError(() => new Error(apiMsg));
                })
            );
    }
}
