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
    // {
    //     id: 'dashboards',
    //     title: 'Dashboards',
    //     subtitle: 'Unique dashboard designs',
    //     type: 'basic',
    //     icon: 'heroicons_outline:home',
    //     link: '/dashboards/project',
    //     children: [
    //     ],
    // },

    // Master Data
    {
        // id: 'list-of-inspection',
        id: 'master-data',
        title: 'Master Data',
        subtitle: 'Setup Master Data',
        type: 'aside',
        icon: 'feather:database',
        children: [
            {
                id: 'master-data.list-of-qualitative-result',
                title:'List Of Qualitative Result',
                type: 'basic',
                icon: 'feather:search',
                link: '/master-data/list-of-qualitative-result',
            },
            {
                id: 'master-data.list-of-unit-measure-setup',
                title: 'List Of Unit Measure',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/master-data/list-of-unit-measure-setup',
            },
            {
                id: 'master-data.list-of-inspection-attributes',
                title: 'List of Inspection Attributes',
                type: 'basic',
                icon: 'heroicons_outline:document-duplicate',
                link: '/master-data/list-of-inspection-attributes',
            },
            {
                id: 'master-data.list-of-inspection-management',
                title: 'List of Inspection Characteristics',
                type: 'basic',
                icon: 'heroicons_outline:document-duplicate',
                link: '/master-data/list-of-inspection-management',
            },
            {
                id: 'master-data.list-of-inspection-card',
                title: 'List of Inspection Card',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/master-data/list-of-inspection-card',
            },
            {
                id: 'master-data.list-of-items-inspection-cards',
                title: 'List Of Item Inspection Card',
                type: 'basic',
                icon: 'feather:search',
                link: '/master-data/list-of-items-inspection-cards',
            },
            {
                id: 'master-data.list-of-items-samples',
                title: 'List Of Item Sample',
                type: 'basic',
                icon: 'feather:server',
                link: '/master-data/list-of-items-samples',
            },
            {
                id: 'master-data.list-of-testing-stepper',
                title: 'Master Stepper',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/master-data/list-of-testing-stepper',
            }

        ],
    },

    //Evaluation Plan
    {
        id: 'evaluation-plan',
        title: 'Evaluation Plan',
        subtitle: 'Unique evaluation plan designs',
        type: 'aside', // Changed from 'basic' to 'aside' so it can have children
        icon: 'heroicons_outline:rectangle-stack',
        children: [
            {
                id: 'evaluation-plan.list-of-evaluation-plan',
                title: 'List of SAP Docs / Evaluation Plan ',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/evaluation-plan/list-of-evaluation-plan',
            },
            // {
            //     id: 'evaluation-plan.list-of-sap-document',
            //     title: 'SAP Documents',
            //     type: 'basic',
            //     icon: 'heroicons_outline:document-text',
            //     link: '/evaluation-plan/list-of-sap-document',
            // },
            // {
            //     id: 'evaluation-plan.list-of-item-cavity',
            //     title: 'List of Item Cavity',
            //     type: 'basic',
            //     icon: 'heroicons_outline:clipboard-document-check',
            //     link: '/evaluation-plan/list-of-item-cavity',
            // },
            // {
            //     id: 'evaluation-plan.plan-purchase-order',
            //     title: 'Plan Purchase Order ',
            //     type: 'basic',
            //     icon: 'heroicons_outline:clipboard-document-check',
            //     link: '/evaluation-plan/plan-purchase-order',
            // },
        ],
    },
    // {
    //     id: 'evaluation-stepper',
    //     title: 'Evaluation Stepper',
    //     subtitle: 'Unique evaluation stepper designs',
    //     type: 'aside', // Changed from 'basic' to 'aside' so it can have children
    //     icon: 'heroicons_outline:adjustments-horizontal',
    //     children: [
    //         {
    //             id: 'evaluation-stepper.new-evaluation-stepper',
    //             title: 'Evaluation Stepper',
    //             type: 'basic',
    //             icon: 'heroicons_outline:clipboard-document-check',
    //             link: '/evaluation-stepper/new-evaluation-stepper',
    //         },
    //     ]
    // }
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

    // SAP Documents (New Aside Section)
    {
        id: 'sap-documents',
        title: 'SAP Documents',
        subtitle: 'Incoming Material Records',
        type: 'aside',
        icon: 'heroicons_outline:clipboard-document-check',
        children: [
            {
                id: 'sap-documents.list-of-incoming-materials',
                title: 'List of Incoming Materials',
                type: 'basic',
                icon: 'heroicons_outline:document-text',
                link: '/sap-documents/list-of-incoming-materials',
            },
            // {
            //     id: 'sap-documents.list-of-incoming-materials',
            //     title: 'List of Evaluation Plan - Incoming QC',
            //     type: 'basic',
            //     icon: 'heroicons_outline:document-text',
            //     link: '/sap-documents/list-of-evaluation-plan-incoming-qc',
            // }
        ]
    }
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
