import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
export const appRoutes: Route[] = [

    // Redirect empty path to 'list-of-inspection-management'
    { path: '', pathMatch: 'full', redirectTo: 'master-data/list-of-inspection-management' },

    // Redirect signed-in user to 'list-of-inspection-management'
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'master-data/list-of-inspection-management' },

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

            // ✅ Removed dashboards route
            // {
            //     path: 'dashboards', children: [
            //         { path: 'project', loadChildren: () => import('app/modules/admin/dashboards/project/project.routes') },
            //     ]
            // },

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
                    { path: 'list-of-item-cavity', loadChildren: () => import('app/modules/admin/master-data/list-of-item-cavity/list-of-item-cavity.routes') },
                ]
            },
            {
                path: 'evaluation-stepper', children: [
                    { path: 'new-evaluation-stepper', loadChildren: () => import('app/modules/admin/stepper-form/evaluation-stepper/evaluation-stepper.routes') },
                ]
            },

        ]
    },
];
