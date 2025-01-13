import { Routes } from "@angular/router";
import { ItemMasterComponent } from "./item-master.component";
import { AddItemMasterComponent } from "./add-item-master/add-item-master.component";
import { EditItemMasterComponent } from "./edit-item-master/edit-item-master.component";


export default [
    {
        path: '',
        component: ItemMasterComponent,
        children: [
        
        ]
    },
    {
        path: 'add-item-master',
        component: AddItemMasterComponent
    },
    {
        path: 'edit-item-master',
        component: EditItemMasterComponent
    }
] as Routes;