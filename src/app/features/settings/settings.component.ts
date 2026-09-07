import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Settings</h1>
      <p>Manage your account settings</p>
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
export class SettingsComponent {}
