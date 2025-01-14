import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'dashboards/project' },

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'dashboards/project' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') },
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [

            // Dashboards
            // {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
            {
                path: 'dashboards', children: [
                    { path: 'project', loadChildren: () => import('app/modules/admin/dashboards/project/project.routes') },
                ]
            },
            {
                path: 'administrator', children: [
                    { path: 'role-management', loadChildren: () => import('app/modules/admin/administrator/role-management/role-management.routes') },
                    { path: 'user-management', loadChildren: () => import('app/modules/admin/administrator/user-management/users-management.routes') },
                    { path: 'approval-template-management', loadChildren: () => import('app/modules/admin/administrator/approval-template-management/approval-template-management.routes') },
                ]
            },
            {
                path: 'item', children: [
                    { path: 'item-master', loadChildren: () => import('app/modules/admin/module/item/item-master/item-master.routes') },
                    // { path: 'item-master-data-list', loadChildren: () => import('app/modules/admin/module/item/item-master-data-list/item-master-data-list.routes') },
                    // { path: 'item-master-data-edit', loadChildren: () => import('app/modules/admin/module/item/item-master-data-edit/item-master-data-edit.routes') },
                ]
            },
            {
                path: 'master-data', children: [
                    { path: 'list-of-inspection-management', loadChildren: () => import('app/modules/admin/master-data/list-of-inspection-management/list-of-inspection-management.routes') },
                ]        
            },

            //using relative path instead of absolute path.
            {
                path: 'business-partner',
                children: [
                    {
                        path: 'customers',
                        loadChildren: () => import('./modules/admin/module/business-partner/customers/customer.routes').then(m => m.CustomerRoutes)
                    },
                    {
                        path: 'vendor',
                        loadChildren: () => import('./modules/admin/module/business-partner/vendor/vendor.routes').then(m => m.VendorRoutes)
                    },
                    {
                        path: 'buyer',
                        loadChildren: () => import('./modules/admin/module/business-partner/buyer/buyer.routes').then(m => m.BuyerRoutes)
                    },
                    {
                        path: 'seller',
                        loadChildren: () => import('./modules/admin/module/business-partner/seller/seller.routes').then(m => m.SellerRoutes)
                    }
                ]
            }

            // {path: 'customer-detail', loadChildren: () => import('app/modules/admin/customers/customers.routes')},

        ]
    },


];

