import { Routes } from "@angular/router";
import { ListOfInspectionCardComponent } from "./list-of-inspection-card.component";
import { AddInspectionCardComponent } from "./folders-inspection-card/add-inspection-card/add-inspection-card.component";
import { EditInspectionCardComponent } from "./folders-inspection-card/edit-inspection-card/edit-inspection-card.component"; 

export default [
    {
        path:'',
        component: ListOfInspectionCardComponent,
        children: [
            {
                path: 'add-inspection-card',
                component: AddInspectionCardComponent
            },
            {
                path: 'edit-inspection-card/:id',
                component: EditInspectionCardComponent
            }
        ]

    }
] as Routes