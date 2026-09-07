import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="forbidden-container">
      <div class="forbidden-card">
        <h1>403 - Access Forbidden</h1>
        <p>You don't have permission to access this resource.</p>
        <a routerLink="/" class="btn-home">Back to Home</a>
      </div>
    </div>
  `,
  styles: [`
    .forbidden-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
    }

    .forbidden-card {
      text-align: center;
      padding: 2rem;
    }

    h1 {
      color: #dc3545;
      margin-bottom: 1rem;
    }

    p {
      color: #666;
      margin-bottom: 2rem;
    }

    .btn-home {
      display: inline-block;
      padding: 0.75rem 2rem;
      background-color: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: opacity 0.3s;
    }

    .btn-home:hover {
      opacity: 0.8;
    }
  `]
})
export class ForbiddenComponent {}
