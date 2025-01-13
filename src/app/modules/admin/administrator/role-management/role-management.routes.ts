import { Routes } from "@angular/router";
import { AddRoleComponent } from "./roles/add-role/add-role.component";
import { RolesComponent } from "./roles/roles.component";


export default [
    {
        path: '',
        component: RolesComponent,
        children: [
            {
                path: 'add-role',
                component: AddRoleComponent
            }
        ]
    }
] as Routes;