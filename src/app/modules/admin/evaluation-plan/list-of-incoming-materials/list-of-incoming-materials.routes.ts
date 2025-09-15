import { Routes } from '@angular/router';
import { ListOfIncomingMaterialsComponent } from './list-of-incoming-materials.component';

const routes: Routes = [
    {
        path: '',
        component: ListOfIncomingMaterialsComponent,
        title: 'List of Incoming Materials',
    },
];

export default routes;