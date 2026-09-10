import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { interval, startWith } from 'rxjs';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

const NOTIFICATIONS_POLL_INTERVAL_MS = 20000;

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  protected authService = inject(AuthService);
  protected notificationService = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  menuOpen = signal(false);
  dropdownOpen = signal(false);

  constructor() {
    interval(NOTIFICATIONS_POLL_INTERVAL_MS)
      .pipe(startWith(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.notificationService.refresh());
  }

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
        this.notificationService.refresh();
        this.router.navigate(['/login']);
      },
      error: () => {
        // If logout POST fails, still log out locally
        this.authService.logoutSync();
        this.notificationService.refresh();
        this.router.navigate(['/login']);
      }
    });
  }
}
