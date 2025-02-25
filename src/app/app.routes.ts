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
                path: 'master-data', children: [
                    { path: 'list-of-inspection-management', loadChildren: () => import('app/modules/admin/master-data/list-of-inspection-management/list-of-inspection-management.routes') },
                    { path: 'list-of-qualitative-result', loadChildren: () => import('app/modules/admin/master-data/list-of-qualitative-result/list-of-qualitative-result.routes') },
                    { path: 'list-of-unit-measure-setup', loadChildren: () => import('app/modules/admin/master-data/list-of-unit-measure-setup/list-of-unit-measure-setup.routes') },
                    { path: 'list-of-items-samples', loadChildren: () => import('app/modules/admin/master-data/list-of-items-samples/list-of-items-samples.routes') },
                    { path: 'list-of-inspection-card', loadChildren: () => import('app/modules/admin/master-data/list-of-inspection-card/list-of-inspection-card.routes') },
                    { path: 'list-of-items-inspection-cards', loadChildren: () => import('app/modules/admin/master-data/list-of-items-inspection-cards/list-of-items-inspection-cards.routes') },
                    {
                        path: 'list-of-testing-stepper', loadChildren: () => import('app/modules/admin/master-data/list-of-testing-stepper/testing-stepper.routes').then(m => m.TestingStepperRoutes)
                    }]
            },
            {
                path: 'evaluation-plan', children: [
                    { path: 'list-of-evaluation-plan', loadChildren: () => import('app/modules/admin/evaluation-plan/list-of-evaluation-plan/list-of-evaluation-plan.routes') },
                    // { path: 'list-of-sap-document', loadChildren: () => import('app/modules/admin/evaluation-plan/list-of-sap-document/list-of-sap-document.routes') },
                    { path: 'list-of-item-cavity', loadChildren: () => import('app/modules/admin/master-data/list-of-item-cavity/list-of-item-cavity.routes') },
                ]
            },

        ]
    },


];

