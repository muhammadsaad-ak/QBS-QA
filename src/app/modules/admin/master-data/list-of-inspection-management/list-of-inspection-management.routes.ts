import { Routes } from "@angular/router";
import { ListOfInspectionComponent } from "./list-of-inspection/list-of-inspection.component";
import { AddListOfInspectionComponent } from "./list-of-inspection/add-list-of-inspection/add-list-of-inspection.component";



export default [
    {
        path: '',
        component: ListOfInspectionComponent,
        children: [
            {
                path: 'add-list-of-inspection',
                component: AddListOfInspectionComponent
            }
        ]
    }
] as Routes;