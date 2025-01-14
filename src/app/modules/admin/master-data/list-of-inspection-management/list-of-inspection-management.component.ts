import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-list-of-inspection-management',
  standalone: true,
  templateUrl: './list-of-inspection-management.component.html',
  styleUrl: './list-of-inspection-management.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet
  ],
})
export class ListOfInspectionManagementComponent {

}
