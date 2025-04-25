import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, of, switchMap, tap, throwError } from 'rxjs';

// Interface FOR GRN PAYLOAD (CreateGRN)
interface GRNPayload {
    documentStatus: string;
    docEntry: number;
    docNum: number;
    docDate: string;
    cardCode: string;
    cardName: string;
    lineNum: number;
    itemCode: string;
    itemDescription: string;
    quantity: number;
    price: number;
    lineStatus: string;
    remainingOpenQuantity: number;
    vatGroup: string;
    warehouse: string;
    uoM: string;
    qStatus: string;
    qCode: string;
}

// Interface FOR API RESPONSE (FOR BETTER TYPE SAFETY)
// CreateReceiptFromProduction RESPONSE
interface ProductionGRNResponse {
    statusCode: number;
    succeeded: boolean;
    message: string;
    errors: any[] | null;
    count: number;
    data: number; // FOR PRODUCTION GRN
}
// CreateGRN RESPONSE
interface GRNResponse {
    statusCode: number;
    succeeded: boolean;
    message: string;
    errors: any[] | null;
    count: number;
    data: {
        docEntry: number;
        poDocEntry: number;
        poLineNum: number;
        errorMessage: string | null;
    }[];
}
// Interface FOR CreateReceiptFromProduction PAYLOAD
interface GRNPayloadProduction {
    docNum: number;
    docEntry: number;
    docDate: string; // ISO Date string
    itemCode: string;
    productName: string;
    plannedQuantity: number;
    uoM: number;
    inventoryUOM: string;
    productionOrderStatus: string;
    warehouse: string;
    completedQuantity: number;
    rejectedQuantity: number;
    machine: string;
    mold: string;
    bmr: string;
    // batchNo: string;
    cavity: number;
    cycleTime: number;
    weight: number;
    lotNo: string;
    shift: string;
    variant: string;
    plant: string;
    qStatus: string;
    qCode: string;
}
// GetPurchaseOrdersByID RESPONSE
interface PurchaseOrderResponse {
    statusCode: number;
    succeeded: boolean;
    message: string;
    errors: any[] | null;
    count: number;
    data: {
        totalRecords: number;
        pageSize: number;
        pageNumber: number;
        values: GRNPayload[]; // 
    };
}
// GetProductionOrdersByID RESPONSE
interface ProductionOrderResponse {
    statusCode: number;
    succeeded: boolean;
    message: string;
    errors: any[] | null;
    count: number;
    data: {
        totalRecords: number;
        pageSize: number;
        pageNumber: number;
        values: GRNPayloadProduction[]; // 
    };
}


@Injectable({
    providedIn: 'root',
})

export class SAPAllServices {
    private _httpClient = inject(HttpClient);
    // BehaviorSubject to hold role data state
    private _listAllItemsSAP = new BehaviorSubject<any[]>([]);
    // Observable to expose role data state
    listAllItemsSAP$: Observable<any[]> = this._listAllItemsSAP.asObservable();
    // Setter & getter for access token
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
    // CREATING PURCHASE GRN IN SAP - @IAK
    GoodReceiptPurchaseGRN(payload: GRNPayload[]): Observable<GRNResponse> {
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json', // Added Content-Type
            'X-API-KEY': 'super'
        });

        return this._httpClient
            .post<GRNResponse>(
                `${environment.SAPitemsApiUrl}/api/B1PurchaseOrders/CreateGRN`,
                payload, // Send the payload
                { headers }
            )
            .pipe(
                tap((response: GRNResponse) => {
                    if (response.succeeded) {
                        console.log('GRN CREATED SUCCESSFULLY', response);
                    }
                }),
                catchError((error) => {
                    console.error('HTTP ERROR WHILE CREATING GRN', error);
                    return throwError(() => error);
                })
            );
    }
    // CREATING PRODUCTION GRN IN SAP - @IAK
    goodReceiptProductionGRN(payload: GRNPayloadProduction): Observable<ProductionGRNResponse> {
        const headers = new HttpHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-API-KEY': 'super'
        });

        return this._httpClient
            .post<ProductionGRNResponse>(
                `${environment.SAPitemsApiUrl}/api/B1ProductionOrders/CreateReceiptFromProduction`,
                payload,
                { headers }
            )
            .pipe(
                tap((response: ProductionGRNResponse) => {
                    if (response.succeeded) {
                        console.log('Production GRN CREATED SUCCESSFULLY', response);
                    }
                }),
                catchError((error) => {
                    console.error('HTTP ERROR WHILE CREATING GRN', error);
                    return throwError(() => error);
                })
            );
    }
    //  - @IAK
    getPurchaseOrdersByID(docNum: number, lineNum: number, itemCode: string): Observable<PurchaseOrderResponse> {
        const headers = new HttpHeaders({
            'Accept': 'text/plain',
            'X-API-KEY': 'super'
        });

        return this._httpClient
            .get(
                `${environment.SAPitemsApiUrl}/api/B1PurchaseOrders/GetPurchaseOrdersByID?docNum=${docNum}&lineNum=${lineNum}&itemCode=${itemCode}`,
                { headers, responseType: 'text' }
            )
            .pipe(
                switchMap((response) => {
                    try {
                        const parsedResponse = JSON.parse(response);
                        return of(parsedResponse);
                    } catch (error) {
                        console.error('ERROR PARSING PURCHASE ORDER RESPONSE', error);
                        return throwError(() => error);
                    }
                }),
                tap((response: PurchaseOrderResponse) => {
                    if (response.succeeded) {
                        console.log('PURCHASE ORDER FETCHED SUCCESSFULLY', response);
                    } else {
                        console.warn('PURCHASE ORDER FETCH FAILED:', response.message);
                    }
                }),
                catchError((error) => {
                    console.error('HTTP ERROR WHILE FETCHING PURCHASE ORDER', error);
                    return throwError(() => error);
                })
            );
    }
    //  - @IAK
    getProductionOrdersByID(docNum: number, itemCode: string): Observable<ProductionOrderResponse> {
        const headers = new HttpHeaders({
            'Accept': 'text/plain',
            'X-API-KEY': 'super'
        });

        return this._httpClient
            .get(
                `${environment.SAPitemsApiUrl}/api/B1ProductionOrders/GetProductionOrdersByID?docNum=${docNum}&itemCode=${itemCode}`,
                { headers, responseType: 'text' }
            )
            .pipe(
                switchMap((response) => {
                    try {
                        const parsedResponse = JSON.parse(response);
                        return of(parsedResponse);
                    } catch (error) {
                        console.error('ERROR PARSING PRODUCTION ORDER RESPONSE', error);
                        return throwError(() => error);
                    }
                }),
                tap((response: ProductionOrderResponse) => {
                    if (response.succeeded) {
                        console.log('PRODUCTION ORDER FETCHED SUCCESSFULLY', response);
                    } else {
                        console.warn('PRODUCTION ORDER FETCH FAILED:', response.message);
                    }
                }),
                catchError((error) => {
                    console.error('HTTP ERROR WHILE FETCHING PRODUCTION ORDER', error);
                    return throwError(() => error);
                })
            );
    }
}
