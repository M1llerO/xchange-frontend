import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Browse Listings</h1>
      <p>Search and browse items available for exchange</p>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem 0;
    }
    h1 { color: #333; }
    p { color: #666; }
  `]
})
export class ListingsComponent {}
