import { Component, input } from '@angular/core';

@Component({
  selector: 'app-table-card',
  imports: [],
  templateUrl: './table-card.html',
  styleUrl: './table-card.css',
})
export class TableCard {
  title = input('');
}
