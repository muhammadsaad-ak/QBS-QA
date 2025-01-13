import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
  encapsulation: ViewEncapsulation.None,

})
export class ExampleComponent {

  constructor()
  {
  }
}
