/* eslint-disable */
import { QbsNavigationItem } from '@qbs/components/navigation';

export const defaultNavigation: QbsNavigationItem[] = [
    {
        id: 'dashboards',
        title: 'Dashboards',
        type: 'group',
        icon: 'heroicons_outline:add_to_home_screen',
        children: [
            {
                id: 'dashboards.project',
                title: 'Project',
                type: 'basic',
                icon: 'heroicons_outline:home',
                link: '/dashboards/project',
            },
        ],
    },
];
export const compactNavigation: QbsNavigationItem[] = [
    // {
    //     id: 'example',
    //     title: 'Example',
    //     type: 'basic',
    //     icon: 'heroicons_outline:chart-pie',
    //     link: '/dashboards/project'
    // }
    
    //Dashboard
    {
        id: 'dashboards',
        title: 'Dashboards',
        subtitle: 'Unique dashboard designs',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboards/project',
        children: [
        ],
    },

    //Administrator
    {
        id: 'apps',
        title: '',
        subtitle: 'Unique dashboard designs',
        type: 'aside',
        icon: 'mat_solid:admin_panel_settings',
        children: [
            {
                id: 'dashboards.project',
                title: 'Role Management',
                type: 'basic',
                icon: 'feather:user-check',
                link: '/administrator/role-management',
            },
            {
                id: 'dashboards.project',
                title: 'User Management',
                type: 'basic',
                icon: 'feather:user-plus',
                link: '/administrator/user-management',
            },
            {
                id: 'dashboards.project',
                title: 'Approval Template Management',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/administrator/approval-template-management',
            },
        ],
    },
    {
        id: 'modules',
        title: '',
        subtitle: 'Unique dashboard designs',
        type: 'aside',
        icon: 'feather:box',
        children: [
            {
                id: 'module.item',
                title: 'Item Master',
                type: 'basic',
                icon: 'heroicons_outline:document-duplicate',
                link: '/item/item-master',
            }
            
        ],
    },
    {
        id: 'business-partner',
        title: '',
        subtitle: 'Unique dashboard designs',
        type: 'aside',
        icon: 'feather:users',
        children: [
            {
                id: 'module.business-partner',
                title: 'Customers',
                type: 'basic',
                icon: 'heroicons_outline:document-duplicate',
                link: '/business-partner/customers',
            },
            {
                id: 'module.business-partner',
                title: 'Vendor',
                type: 'basic',
                icon: 'heroicons_outline:document-duplicate',
                link: '/business-partner/vendor',
            },
            {
                id: 'module.business-partner',
                title: 'Buyer',
                type: 'basic',
                icon: 'heroicons_outline:document-duplicate',
                link: '/business-partner/buyer',
            },
            {
                id: 'module.business-partner',
                title: 'Seller',
                type: 'basic',
                icon: 'heroicons_outline:document-duplicate',
                link: '/business-partner/seller',
            },
            
        ],
    },
    
];
export const futuristicNavigation: QbsNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const horizontalNavigation: QbsNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
