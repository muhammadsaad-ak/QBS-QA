import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ApprovalTemplateManagementService {
    private _httpClient = inject(HttpClient);

    // BehaviorSubject to hold role data state
    private _templates = new BehaviorSubject<any[]>([]);
    private _users = new BehaviorSubject<any[]>([]);


    // Observable to expose role data state
    templates$: Observable<any[]> = this._templates.asObservable();
    users$: Observable<any | null> = this._users.asObservable();


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
     * Fetch the list of all approval templates
     *
     * @returns Observable of approval templates
     */
    listAllApprovalTemplates(): Observable<any> {
        // Set up the headers with the Authorization token
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        // Perform the GET request
        return this._httpClient
            .get(
                `${environment.apiUrl}/api/ApprovalTemplates/ListAllApproalTemplates`,
                { headers }
            )
            .pipe(
                tap((templates) => {
                    // Optionally handle the response or log it
                    console.log('Approval templates fetched:', templates);
                    const templatesData = (templates as any).data ?? [];
                    this._templates.next(templatesData);
                }),
                catchError((error) => {
                    console.error('Error fetching approval templates:', error);
                    return throwError(
                        () => new Error('Error fetching approval templates')
                    );
                })
            );
    }

    /**
     * Fetch the list of all roles
     *
     * @returns Observable of roles
     */
    listAllUsers(): Observable<any> {
        // Set up the headers with the Authorization token
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.apiUrl}/api/ApprovalTemplates/ListAllUsers`, {
                headers,
            })
            .pipe(
                tap((users) => {
                    // Optionally, you can update the state or handle the response here
                    this._users.next(users as any)
                    console.log('Approval Template Users fetched:', users);
                }),
                catchError((error) => {
                    console.error('Error fetching approval template users:', error);
                    return throwError(() => new Error('Error fetching approval template users'));
                })
            );
    }

    /**
     * Fetch the list of all modules
     *
     * @returns Observable of all modules
     */
    listAllModules(): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(`${environment.apiUrl}/api/RoleManager/ListAllModules`, { headers })
            .pipe(
                tap((modules) => {
                    console.log('Modules fetched:', modules);
                }),
                catchError((error) => {
                    console.error('Error fetching modules:', error);
                    return throwError(() => new Error('Error fetching modules'));
                })
            );
    }

     /**
     * Add a new approval template
     *
     * @param template The approval template data to be added
     * @returns Observable of the created approval template
     */
     addApprovalTemplate(template: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
            'Content-Type': 'application/json',
        });

        return this._httpClient
            .post(
                `${environment.apiUrl}/api/ApprovalTemplates/AddApprovalTemplate`,
                template,
                { headers }
            )
            .pipe(
                tap((response) => {
                    console.log('Approval template added:', response);
                    this.listAllApprovalTemplates().subscribe(templates => {
                        this._templates.next(templates.data);
                        console.log('Approval template list refreshed after adding a new approval template');
                    });
                }),
                catchError((error) => {
                    console.error('Error adding approval template:', error);
                    return throwError(() => new Error('Error adding approval template'));
                })
            );
    }

    /**
     * Fetch a specific approval template by its ID
     *
     * @param templateId The ID of the approval template to fetch
     * @returns Observable of the approval template
     */
    getApprovalTemplateById(templateId: number): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
        });

        return this._httpClient
            .get(
                `${environment.apiUrl}/api/ApprovalTemplates/GetApprovalTemplate/${templateId}`,
                { headers }
            )
            .pipe(
                tap((template) => {
                    console.log('Approval template fetched:', template);
                }),
                catchError((error) => {
                    console.error('Error fetching approval template:', error);
                    return throwError(() => new Error('Error fetching approval template'));
                })
            );
    }

    /**
     * Update an existing approval template
     *
     * @param templateId The ID of the approval template to update
     * @param template The updated approval template data
     * @returns Observable of the updated approval template
     */
    updateApprovalTemplate(templateId: number, template: any): Observable<any> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'text/plain',
            'Content-Type': 'application/json',
        });

        return this._httpClient
            .post(
                `${environment.apiUrl}/api/ApprovalTemplates/UpdateApprovalTemplate/${templateId}`,
                template,
                { headers }
            )
            .pipe(
                tap((response) => {
                    console.log('Approval template updated:', response);
                    this.listAllApprovalTemplates().subscribe(templates => {
                        this._templates.next(templates.data);
                        console.log('Approval template list refreshed after update a new approval template');
                    });
                }),
                catchError((error) => {
                    console.error('Error updating approval template:', error);
                    return throwError(() => new Error('Error updating approval template'));
                })
            );
    }

}
