import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-approval-template-management',
  standalone: true,
  templateUrl: './approval-template-management.component.html',
  styleUrl: './approval-template-management.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet
  ],
})
export class ApprovalTemplateManagementComponent {

}
