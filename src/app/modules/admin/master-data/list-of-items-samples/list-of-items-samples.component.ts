import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-list-of-items-samples',
  standalone: true,
  templateUrl: './list-of-items-samples.component.html',
  styleUrl: './list-of-items-samples.component.scss',
  // imports: [],
  imports: [RouterOutlet],
  encapsulation: ViewEncapsulation.None,
})
export class ListOfItemsSamplesComponent {

}
