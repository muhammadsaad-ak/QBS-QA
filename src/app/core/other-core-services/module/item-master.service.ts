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
export class ItemMasterService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _items = new BehaviorSubject<any[]>([]);

    // Observable to expose role data state
    items$: Observable<any[]> = this._items.asObservable();

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    // get accessToken(): string {
    //     return localStorage.getItem('accessToken') ?? '';
    // }

    /**
     * Fetch the list of items and store in state
     *
     * @returns Observable of items
     */
    getAllItems(): Observable<any> {
        // Set up the headers with the Authorization token
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.appApiUrl}/api/ItemMaster/ListAllItems`, {
                headers,
            })
            .pipe(
              tap((items) => {
                  // Optionally handle the response or state update here
                  const itemsAccess = (items as any).data ?? [];
                  this._items.next(itemsAccess);
                  console.log('Fetched items', itemsAccess);
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
