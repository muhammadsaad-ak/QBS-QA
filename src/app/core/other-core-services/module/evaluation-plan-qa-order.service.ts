import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, of, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluationPlanQaOrderService {

  constructor(private _httpClient: HttpClient) { }

    private _qaProductionCode = new BehaviorSubject<any[]>([]);
    private _listEvaluationPlanProductionOrdersQA = new BehaviorSubject<any[]>([]);
    private _itemIdIIC = new BehaviorSubject<any[]>([]);
    private _cardByCode = new BehaviorSubject<any[]>([])
    private _getProductionByQACode = new BehaviorSubject<any[]>([])
    private _getProductionQAId = new BehaviorSubject<any[]>([])
    private _allCavitySamples = new BehaviorSubject<any[]>([])



    qaProductionCode$: Observable<any[]> = this._qaProductionCode.asObservable();
    listEvaluationPlanProductionOrdersQA$: Observable<any[]> = this._listEvaluationPlanProductionOrdersQA.asObservable();
    itemIdSAP$: Observable<any[]> = this._itemIdIIC.asObservable();
    cardbycode$: Observable<any[]> = this._cardByCode.asObservable();
    getProductionByQACode: Observable<any[]> = this._getProductionByQACode.asObservable()
    getProductionQAId: Observable<any[]> = this._getProductionQAId.asObservable()
    allCavitySamples: Observable<any[]> = this._allCavitySamples.asObservable()





    


  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

    getProductionQACode(): Observable<any> {
      const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'text/plain',
      });
  
      return this._httpClient
          .get(`${environment.appApiUrl}/CSAPI/INextIntCodeFeature/GetNextIntCount?entityName=production_qa`, { headers })
          .pipe(
              tap((productionQACode) => {
                  const productionQAResultsCode = (productionQACode as any) ?? [];
                  this._qaProductionCode.next(productionQAResultsCode);
                  console.log('Fetched code for Production QA:', productionQAResultsCode);
              }),
              catchError((error) => {
                  console.error('Error fetching Production QA Code:', error);
                  return throwError(() => new Error('Error fetching Prodcution QA Code'));
              })
          );
  }

    getEvaluationPlanProductionOrdersQA(): Observable<any> {
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
    });

    return this._httpClient.get(`${environment.appApiUrl}/CSAPI/IProductionQAFeature/ListAllProductionQAsWithItem`, { headers })
        .pipe(
            tap((response: any) => {
                console.log('API Response:', response);
                this._listEvaluationPlanProductionOrdersQA.next(response);
            }),
            catchError((error) => {
                console.error('Error fetching Evaluation Plan Production QA Orders', error);
                return throwError(() => new Error('Error fetching Evaluation Plan Production QA Orders'));
            })
        );
  }

    addProductionQA(data: any): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.accessToken}`,
    'Content-Type': 'application/json',
  });

   return this._httpClient.post(
      `${environment.appApiUrl}/CSAPI/IProductionQAFeature/AddProductionQA`,
      data,
      { headers }
  ).pipe(
      tap(response => console.log('RESPONSE:', response)),
      catchError(error => {
          console.error('Error adding prod result', error);
          return throwError(() => new Error('Error adding qualitative result'));
      })
  );
  }

    // GET ITEM ID API
    GetItemIdByCode(itemCode: string): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      });
  
      return this._httpClient
        .get(`${environment.appApiUrl}/CSAPI/IItemCardFeature/GetItemByCode?itemCode=${itemCode}`, { headers })
        .pipe(
          tap((itemId) => {
            // console.log('API RESPONSE:', itemId);
            const fetchedItemId = (itemId as any).data ?? [];
            this._itemIdIIC.next(fetchedItemId);
            // console.log('FETCHED RESPONSE', fetchedItemId);
          }),
          catchError((error) => {
            console.error('ERROR WHILE FETCHING ITEM ID', error);
            return throwError(error);
          })
        );
    }

    getItemCode(itemCode: string): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      });
    
      return this._httpClient.get(`${environment.appApiUrl}/CSAPI/IItemInspectionCardFeature/GetCardByCodeWithBothCharacteristics?itemCode=${itemCode}`,
          { headers }
      )
      .pipe(
          tap((response: any) => {
              const cardByCode = response?.data?.value ?? []
              this._cardByCode.next(cardByCode);
          }),
          catchError((error) => {
              console.error('Error fetching item code', error);
              return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`))
          })
      )
    }

    GetProductionQAId(itemCode: string, docNum: string): Observable<any> {
      const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json'
          });
          
           return this._httpClient.get(
              `${environment.appApiUrl}/CSAPI/IProductionQAFeature/GetProductionQAId?itemCode=${itemCode}&docNumber=${docNum}`,
          { headers }
      )
      .pipe(
          tap((response: any) => {
              const getProductionByQACode = response?.data?.value ?? []                
              this._getProductionByQACode.next(getProductionByQACode);
          }),
          catchError((error) => {
              console.error('Error fetching item code', error);
              return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`))
          })
      )

  }

  addProductionCavityQA(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    });
  
     return this._httpClient.post(
        `${environment.appApiUrl}/CSAPI/IProductionQACavityFeature/AddProductionQACavity`,
        data,
        { headers }
    ).pipe(
        tap(response => console.log('RESPONSE:', response)),
        catchError(error => {
            console.error('Error adding AddProductionQACavity', error);
            return throwError(() => new Error('Error adding AddProductionQACavity'));
        })
    );
    }

    getAllCavitiesByQaId(qaId: string): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      });
    
      return this._httpClient.get
      (`${environment.appApiUrl}/CSAPI/IProductionQACavityFeature/ListAllProductionQACavityByQaId`, {
        headers,
        params: { qaId },
      }).pipe(
        tap((response: any) => {
          console.log(`🧾 All cavities for QA ID ${qaId}:`, response);
        }),
        catchError((error) => {
          console.error(`❌ Error fetching cavities for QA ID ${qaId}`, error);
          return throwError(() => new Error('Error fetching cavity list by QA ID'));
        })
      );
    }

    addProductionQACavitySample(data: any): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      });
    
       return this._httpClient.post(
          `${environment.appApiUrl}/CSAPI/IProductionQACavitySampleFeature/AddProductionQACavitySample`,
          data,
          { headers }
      ).pipe(
          tap(response => console.log('RESPONSE:', response)),
          catchError(error => {
              console.error('Error adding production cavity result', error);
              return throwError(() => new Error('Error adding production cavity result'));
          })
      );
    }

      getIsSamplePassedListByProdQACavityId(qaId: string): Observable<boolean[]> {
        if (!qaId) {
          console.error('QC ID IS MISSING, CANNOT PROCEED FUTTHER!:');
          return throwError(() => new Error('QC ID IS MISSING, CANNOT PROCEED FURTHER'));
        }
    
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        });
        
        console.log('QC ID ~ qcId:', qaId);
    
        return this._httpClient
            .get(`${environment.appApiUrl}/CSAPI/IProductionQCSampleFeature/ListAllProductionQACavitySamplesByCavityId?cavityId=${qaId}`, { headers })
          .pipe(
            tap((response: any) => {
              // console.log('SERVER RESPONSE ~ response:', response);
            }),
            map((response: any) => {
              const data = response?.data ?? [];
              const isSamplePassedList = data.map((item: any) => item.isSamplePassed);
              console.log('SAMPLES STATUS ~ isSamplePassedList:', isSamplePassedList);
              return isSamplePassedList;
            }),
            catchError((error) => {
              console.error('API CALLING FAILED:', error);
              console.error('ERROR STATUS:', error.status);
              console.error('ERROR MESSAGE:', error.error?.message);
              return throwError(() => new Error('FAILED TO FETCH isSamplePassedList!'));
            })
          );
      }

      ListAllProductionQASamplesByQAId(cavityId: string) {
        const headers = new HttpHeaders({
         Authorization: `Bearer ${this.accessToken}`,
         'Content-Type': 'application/json',
         });
         
          return this._httpClient.get(
             `${environment.appApiUrl}/CSAPI/IProductionQACavitySampleFeature/ListAllProductionQACavitySamplesByCavityId?productionQcId=${cavityId}`,
         { headers }
      )
      .pipe(
         tap((response: any) => {
             const getProductionQAId = response?.data?.value ?? []                
             this._getProductionQAId.next(getProductionQAId);
         }),
         catchError((error) => {
             console.error('Error fetching item code', error);
             return throwError(() => new Error(`Error fetching Production Orders: ${error.message}`))
         })
      )
      }

      GetProductionQACavityById(cavityId: string): Observable<any> {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json'
        });
      
        return this._httpClient
          .get(`${environment.appApiUrl}/CSAPI/IProductionQACavityFeature/GetProductionQACavityById?id=${cavityId}`, {
            headers
          })
          .pipe(
            tap((response: any) => {
              console.log('Cavity Data:', response?.data);
            }),
            catchError((error) => {
              console.error('Error fetching Cavity Info:', error);
              return throwError(() => new Error(`Error fetching Cavity Info: ${error.message}`));
            })
          );
      }

      getAllProductionQASamplesByCavityId(cavityId: string) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        });
      
        return this._httpClient.get(
          `${environment.appApiUrl}/CSAPI/IProductionQACavitySampleFeature/ListAllProductionQACavitySamplesByCavityId?cavityId=${cavityId}`,
          { headers }
        ).pipe(
          tap((response: any) => {
            const cavitySamples = response?.data?.value ?? [];
            this._allCavitySamples.next(cavitySamples); // You can use your own BehaviorSubject or logic here
          }),
          catchError((error) => {
            console.error('Error fetching Cavity Samples', error);
            return throwError(() => new Error(`Error fetching Cavity Samples: ${error.message}`));
          })
        );
      }
      // Getting all production QA cavities by QA ID
      getAllProductionQACavitiesByQaId(qaId: string) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        });
      
        return this._httpClient.get(
          `${environment.appApiUrl}/CSAPI/IProductionQACavityFeature/ListAllProductionQACavityByQaId?qaId=${qaId}`,
          { headers }
        ).pipe(
          tap((response: any) => {
            console.log('Fetched QA Cavities:', response);
          }),
          catchError((error) => {
            console.error('Error fetching QA Cavities', error);
            return throwError(() => new Error(`Error fetching QA Cavities: ${error.message}`));
          })
        );
      }

      getProductionQACavityById(cavityId: string) {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        });
      
        return this._httpClient.get(
          `${environment.appApiUrl}/CSAPI/IProductionQACavityFeature/GetProductionQACavityById?id=${cavityId}`,
          { headers }
        ).pipe(
          tap((response: any) => {
            console.log('Fetched Cavity By ID:', response);
          }),
          catchError((error) => {
            console.error('Error fetching cavity by ID:', error);
            return throwError(() => new Error(`Error fetching cavity by ID: ${error.message}`));
          })
        );
      }

  
}
