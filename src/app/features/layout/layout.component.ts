import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  menuOpen = signal(false);
  dropdownOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.menuOpen.set(false);
        this.dropdownOpen.set(false);
        this.router.navigate(['/login']);
      },
      error: () => {
        // If logout POST fails, still log out locally
        this.authService.logoutSync();
        this.router.navigate(['/login']);
      }
    });
  }
}
