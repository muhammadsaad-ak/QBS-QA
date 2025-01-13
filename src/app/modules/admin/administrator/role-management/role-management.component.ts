import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-role-management',
  standalone: true,
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet
  ],
})
export class RoleManagementComponent {

}
