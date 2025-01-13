import { Routes } from "@angular/router";
import { ApprovalTemplateComponent } from "./approval-template/approval-template.component";
import { AddApprovalTemplateComponent } from "./approval-template/add-approval-template/add-approval-template.component";
import { EditApprovalTemplateComponent } from "./approval-template/edit-approval-template/edit-approval-template.component";


export default [
    {
        path: '',
        component: ApprovalTemplateComponent,
        children: [
            {
                path: 'add-approval-template',
                component: AddApprovalTemplateComponent
            },
            {
                path: 'edit-approval-template/:id',
                component: EditApprovalTemplateComponent
            }
        ]
    }
] as Routes;