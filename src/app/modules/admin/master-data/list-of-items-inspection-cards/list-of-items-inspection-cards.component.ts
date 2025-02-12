import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-list-of-items-inspection-cards',
  standalone: true,
  templateUrl: './list-of-items-inspection-cards.component.html',
  styleUrl: './list-of-items-inspection-cards.component.scss',
  imports: [RouterOutlet],
  encapsulation: ViewEncapsulation.None,
})
export class ListOfItemsInspectionCardsComponent {

}
