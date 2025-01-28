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

    {
        id: 'list-of-inspection',
        title: '',
        subtitle: 'Unique dashboard designs',
        type: 'aside',
        icon: 'feather:database',
        children: [
            {
                id: 'master-data.list-of-inspection-management',
                title: 'List of Inspection 1.0',
                type: 'basic',
                icon: 'heroicons_outline:document-duplicate',
                link: '/master-data/list-of-inspection-management',
            },
            {
                id: 'master-data.list-of-qualitative-result',
                title: 'Qualitative Result 0.1',
                type: 'basic',
                icon: 'feather:search',
                link: '/master-data/list-of-qualitative-result',
            },
            {
                id: 'master-data.list-of-unit-measure-setup',
                title: 'Unit Measure-Setup 0.2',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/master-data/list-of-unit-measure-setup',
            }
            
        ],
    },
    // {
    //     id: 'list-of-qualitative-result',
    //     title: '',
    //     subtitle: 'Unique dashboard designs',
    //     type: 'aside',
    //     icon: 'feather:search',
    //     children: [
    //         {
    //             id: 'master-data.list-of-qualitative-result',
    //             title: 'Qualtitative Result 0.1',
    //             type: 'basic',
    //             icon: 'heroicons_outline:document-duplicate',
    //             link: '/master-data/list-of-qualitative-result',
    //         }
            
    //     ],
    // },
    
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
