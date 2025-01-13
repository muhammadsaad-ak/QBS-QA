import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet
  ],
})
export class UserManagementComponent {

}
