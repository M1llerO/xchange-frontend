import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from './message';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  unreadThreadCount = signal(0);

  refresh(): void {
    if (!this.authService.isLoggedIn()) {
      this.unreadThreadCount.set(0);
      return;
    }
    this.messageService.getMine(true).subscribe({
      next: (messages) => {
        const threadIds = new Set(messages.map((m) => m.offerId));
        this.unreadThreadCount.set(threadIds.size);
      },
      error: () => {}
    });
  }
}
