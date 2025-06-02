import { Routes } from "@angular/router";
import { InspectionAttributesComponent } from "./inspection-attributes/inspection-attributes.component";

export default [
    {
        path: '',
        component: InspectionAttributesComponent,
        children: []
    }
] as Routes;