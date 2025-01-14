import { Routes } from "@angular/router";
import { ListOfInspectionComponent } from "./list-of-inspection/list-of-inspection.component";
import { AddListOfInspectionComponent } from "./list-of-inspection/add-list-of-inspection/add-list-of-inspection.component";
import { EditListOfInspectionComponent } from "./list-of-inspection/edit-list-of-inspection/edit-list-of-inspection.component";



export default [
    {
        path: '',
        component: ListOfInspectionComponent,
        children: [
            {
                path: 'add-list-of-inspection',
                component: AddListOfInspectionComponent
            },
            {
                path: 'edit-list-of-inspection/:id',
                component: EditListOfInspectionComponent
            }
        ]
    }
] as Routes;