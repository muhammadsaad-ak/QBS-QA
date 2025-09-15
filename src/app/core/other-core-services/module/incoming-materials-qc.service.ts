import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'environments/environment';

// INTERFACES
interface ApiResponse<T> {
    isApiHandled: boolean;
    isRequestSuccess: boolean;
    statusCode: number;
    message: string;
    data: T;
    exception: any[];
}
// UpdateIncomingQC
export interface UpdateIncomingQCRequest {
    id: string;
    evaluationStatus: string;
    overallStatus: boolean;
    remarks: string;
    isPerformed: boolean;
    isPostedToSap: boolean;
    isClosed: boolean;
    operatedBy: string;
    barcode: string;
    batchNo: string;
    isBarcodeGenerated: boolean;
    reportReviewDate: string;
    reportNextReviewDate: string;
    reportRemarks: string;
    isActive: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class IncomingMaterialsQcService {

    private baseUrl = `${environment.appApiUrl}/CSAPI`;
    constructor(private http: HttpClient) { }

    // POST API
    // AddIncomingQC
    addIncomingQC(payload: any): Observable<any> {
        return this.http
            .post<ApiResponse<any>>(`${this.baseUrl}/IIncomingQCFeature/AddIncomingQC`, payload)
            .pipe(
                map((res) => {
                    if (res.isRequestSuccess) {
                        return res.data;
                    } else {
                        throw new Error(res.message || 'Failed to perform Incoming QC');
                    }
                }),
                catchError(this.handleError('addIncomingQC'))
            );
    }
    // PUT API 
    // UpdateIncomingQC
    updateIncomingQC(payload: any): Observable<any> {
        return this.http
            .put<ApiResponse<any>>(`${this.baseUrl}/IIncomingQCFeature/UpdateIncomingQC`, payload)
            .pipe(
                map((res) => {
                    if (res.isRequestSuccess) {
                        return res.data;
                    } else {
                        throw new Error(res.message || 'Failed to update Incoming QC (Full)');
                    }
                }),
                catchError(this.handleError('updateIncomingQCFull'))
            );
    }
    // GET APIS
    // ListAllIncomingQCsWithItem
    getAllIncomingQCsWithItem(): Observable<any> {
        const url = `${this.baseUrl}/IIncomingQCFeature/ListAllIncomingQCsWithItem`;
        return this.http.get<any>(url).pipe(
            catchError((error) => {
                console.error('Error fetching Incoming QCs with items:', error);
                return throwError(() => error);
            }),
            catchError(this.handleError('getAllIncomingQCsWithItem'))
        );
    }

    private handleError(context: string) {
        return (err: any) => {
            let errorMsg = `Error in ${context}: `;

            if (err.status === 0) {
                errorMsg += 'Server not reachable. Please check your network.';
            } else if (err.status === 400) {
                errorMsg += 'Validation failed. Please check form values.';
            } else if (err.status === 404) {
                errorMsg += 'API endpoint not found.';
            } else if (err.status === 500) {
                errorMsg += 'Internal server error. Please try again later.';
            } else if (err?.error?.message) {
                errorMsg += err.error.message;
            } else {
                errorMsg += err.message || 'Unexpected error occurred';
            }
            
            console.error(errorMsg, err);
            return throwError(() => new Error(errorMsg));
        };
    }
}