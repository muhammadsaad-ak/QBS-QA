import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { RoleManagementComponent } from './role-management/role-management.component';
import { UsersComponent } from './user-management/users/users.component';

export default [
    {
        path: '',
        component: RoleManagementComponent,
       
    },
    {
        path: 'user-management',
        component: UsersComponent,
        children: [
        ]
       
    },
] as Routes;
