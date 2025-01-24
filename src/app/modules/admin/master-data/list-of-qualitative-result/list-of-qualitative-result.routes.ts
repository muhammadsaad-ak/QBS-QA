import { Routes } from "@angular/router";
import { QualitativeResultComponent } from "./qualitative-result/qualitative-result.component";
import { AddQualitativeResultComponent } from "./qualitative-result/add-qualitative-result/add-qualitative-result.component";
import { EditQualitativeResultComponent } from "./qualitative-result/edit-qualitative-result/edit-qualitative-result.component";



export default [
    {
        path: '',
        component: QualitativeResultComponent,
        children: [
            {
                path: 'add-qualitative-result',
                component: AddQualitativeResultComponent
            },
            {
                path: 'edit-qualitative-result/:id',
                component: EditQualitativeResultComponent
            }
        ]
    }
] as Routes;