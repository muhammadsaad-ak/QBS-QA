import { Routes } from "@angular/router";
import { ItemsSamplesComponent } from "./items-samples/items-samples.component";
import { ListOfItemsSamplesComponent } from "./list-of-items-samples.component";
import { AddItemSampleComponent } from "./items-samples/add-item-sample/add-item-sample.component";



export default [
    {
        path: '',
        component: ItemsSamplesComponent,
        // children: [
        //     {
        //         path: 'add-item-sample',
        //         component: AddItemSampleComponent
        //     },          
        // ]
    },
    {
        path: 'add-item-sample',
        component: AddItemSampleComponent
    },
] as Routes;