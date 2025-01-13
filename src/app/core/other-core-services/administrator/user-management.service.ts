import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap, throwError, BehaviorSubject, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { UserList } from "app/modules/admin/administrator/user-management/user-management.types";


@Injectable({ providedIn: 'root'})
export class UserManagementService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold user data state
    private _users = new BehaviorSubject<any[]>([]);
    private _user = new BehaviorSubject<any | null>(null);

    // Observable to expose user data state
    users$: Observable<UserList[]> = this._users.asObservable();
    user$: Observable<any | null> = this._user.asObservable();

     /**
     * Setter & getter for access token
     */
     set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }


    /**
    * Fetch the list of users and store in state
    *
    * @returns Observable of users
    */

    getUsersList(): Observable<any> {
        // Set up the headers with the Authorization token
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.accessToken}`
        });

        return this._httpClient.get(`${environment.apiUrl}/api/Accounts/ListAllUsers`, { headers }).pipe(
            switchMap(response => {
                // Explicitly handle the case where data might be undefined/null
                const users = (response as any).data ?? [];
                return of(users);
            }),
            tap((users) => {
                //Update the state
                this._users.next(users);
            }),
            catchError((error) => {
                console.error('Error fetching users:', error);
                return of([]);
            })
        )
    }


    /**
     * Add a new user
     * 
     * @param user User data to be added
     * @returns Observable of the added user response
    */
    addUser(user: UserList): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        });
    
        return this._httpClient.post(`${environment.apiUrl}/api/Accounts/RegisterUser`, user, { headers }).pipe(
            tap(response => {
                console.log('User added successfully:', response);
            
                this.getUsersList().subscribe(users => {
                    this._users.next(users);
                    console.log('User list refreshed after adding a new user');
                });
            }),
            catchError(error => {
                console.error('Error adding user:', error);
                return throwError(() => new Error('Failed to add user. Please try again later.'));
            })
        );
    }


    updateUser(user: UserList): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        });
    
        return this._httpClient.post(`${environment.apiUrl}/api/Accounts/UpdateUser`, user, { headers }).pipe(
            tap(response => {
                console.log('User updated successfully:', response);
    
                // Refresh user list after update
                this.getUsersList().subscribe(users => {
                    this._users.next(users);
                    console.log('User list refreshed after update');
                });
            }),
            catchError(error => {
                console.error('Error updating user:', error);
                return throwError(() => new Error('Failed to update user. Please try again later.'));
            })
        );
    }
    



}