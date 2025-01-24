import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-list-of-qualitative-result',
  standalone: true,
  templateUrl: './list-of-qualitative-result.component.html',
  styleUrl: './list-of-qualitative-result.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet
  ],
})
export class ListOfQualitativeResultComponent {

}
