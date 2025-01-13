import { Routes } from "@angular/router";
import { UsersComponent } from "./users/users.component";
import { AddUserComponent } from "./users/add-user/add-user.component";
import { EditUserComponent } from "./users/edit-user/edit-user.component";



export default [
    {
        path: '',
        component: UsersComponent,
        children: [
            {
                path: 'add-user',
                component: AddUserComponent
            },
            {
                path: 'edit-user/:id',
                component: EditUserComponent
            }
        ]
    }
] as Routes;