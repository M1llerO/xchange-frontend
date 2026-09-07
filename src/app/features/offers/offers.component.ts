import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Offers</h1>
      <p>View and manage your exchange offers</p>
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
export class OffersComponent {}
