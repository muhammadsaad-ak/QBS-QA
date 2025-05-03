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
export class RoleManagementService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _roles = new BehaviorSubject<any[]>([]);

    // Observable to expose role data state
    roles$: Observable<any[]> = this._roles.asObservable();

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
     * Fetch the list of roles and store in state
     *
     * @returns Observable of roles
     */
    getAllData(): Observable<any> {
        // Set up the headers with the Authorization token
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.apiUrl}/api/RoleManager/PopulateTreeForAdd`, {
                headers,
            })
            .pipe(
              tap((roles) => {
                  // Optionally handle the response or state update here
                  const rolesAccess = (roles as any).data ?? [];
                  this._roles.next(rolesAccess);
                  console.log('Fetched role by ID:', rolesAccess);
              }),
              catchError((error) => {
                  console.error('Error fetching role by ID:', error);
                  return throwError(
                      () => new Error('Error fetching role by ID')
                  );
              })
          );
    }

    /**
     * Add a new role to the system
     *
     * @param roleData The role data to be added
     * @returns Observable of the API response
     */
    addRole(roleData: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });

        return this._httpClient
            .post(`${environment.apiUrl}/api/RoleManager/AddRole`, roleData, {
                headers,
            })
            .pipe(
                catchError((error) => {
                    console.error('Error adding role:', error);
                    return throwError(() => new Error('Error adding role'));
                })
            );
    }

    /**
     * Fetch the list of all roles
     *
     * @returns Observable of roles
     */
    listAllRoles(): Observable<any> {
        // Set up the headers with the Authorization token
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.apiUrl}/api/RoleManager/ListAllRoles`, {
                headers,
            })
            .pipe(
                tap((roles) => {
                    // Optionally, you can update the state or handle the response here
                    // console.log('Roles fetched:', roles);
                }),
                catchError((error) => {
                    console.error('Error fetching roles:', error);
                    return throwError(() => new Error('Error fetching roles'));
                })
            );
    }

    /**
     * Fetch a role by its ID
     *
     * @param id The ID of the role
     * @returns Observable of the role data
     */
    getRoleByID(id: number): Observable<any> {
        // Set up the headers with the Authorization token
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.apiUrl}/api/RoleManager/GetRoleByID`, {
                headers,
                params: { id: id.toString() }, // Passing the ID as a query parameter
            })
            .pipe(
                tap((role) => {
                    // Optionally handle the response or state update here
                    console.log('Fetched role by ID:', role);
                }),
                catchError((error) => {
                    console.error('Error fetching role by ID:', error);
                    return throwError(
                        () => new Error('Error fetching role by ID')
                    );
                })
            );
    }

    /**
     * Update a document tab
     *
     * @param payload The payload containing docCode, tabCode, and isChecked
     * @returns Observable of the API response
     */
    updateDocTab(payload: { roleId: number; docCode: string; tabCode: string; isChecked: boolean }): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        });
    
        return this._httpClient
            .post(`${environment.apiUrl}/api/RoleManager/UpdateDocTab`, payload, { headers })
            .pipe(
                catchError((error) => {
                    console.error('Error updating document tab:', error);
                    return throwError(() => new Error('Error updating document tab'));
                })
            );
    }

}
