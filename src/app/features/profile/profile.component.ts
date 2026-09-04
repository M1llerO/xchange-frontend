import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Profile</h1>
      <p>View your profile information</p>
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
export class ProfileComponent {}
