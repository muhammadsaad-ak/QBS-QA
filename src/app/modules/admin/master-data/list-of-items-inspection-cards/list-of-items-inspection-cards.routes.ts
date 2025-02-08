import { Routes } from "@angular/router";
import { ItemsInspectionCardsComponent } from "./items-inspection-cards/items-inspection-cards.component";
import { AddItemsInspectionCardsComponent } from "./items-inspection-cards/add-items-inspection-cards/add-items-inspection-cards.component";
import { EditItemsInspectionCardsComponent } from "./items-inspection-cards/edit-items-inspection-cards/edit-items-inspection-cards.component";

export default [
    {
        path: '',
        component: ItemsInspectionCardsComponent,
        // children: []
    },
    {
        path: 'add-items-inspection-cards',
        component: AddItemsInspectionCardsComponent
    },
    {
        path: 'edit-items-inspection-cards/:id',
        component: EditItemsInspectionCardsComponent
    }
] as Routes;