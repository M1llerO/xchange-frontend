import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Messages</h1>
      <p>Communicate with other users</p>
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
export class MessagesComponent {}
