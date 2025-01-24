import { Routes } from "@angular/router";
import { UnitMeasureSetupComponent } from "./unit-measure-setup/unit-measure-setup.component";
import { AddUnitMeasureSetupComponent } from "./unit-measure-setup/add-unit-measure-setup/add-unit-measure-setup.component";
import { EditUnitMeasureSetupComponent } from "./unit-measure-setup/edit-unit-measure-setup/edit-unit-measure-setup.component";



export default [
    {
        path: '',
        component: UnitMeasureSetupComponent,
        children: [
            {
                path: 'add-unit-measure-setup',
                component: AddUnitMeasureSetupComponent
            },
            {
                path: 'edit-unit-measure-setup/:id',
                component: EditUnitMeasureSetupComponent
            }
        ]
    }
] as Routes;