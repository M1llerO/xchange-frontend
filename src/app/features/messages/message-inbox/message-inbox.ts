import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { MessageService } from '../../../services/message';
import { AuthService } from '../../../services/auth';
import { MessageDto } from '../../../models/message.model';

const POLL_INTERVAL_MS = 10000;

@Component({
  selector: 'app-message-inbox',
  imports: [CommonModule, RouterLink],
  templateUrl: './message-inbox.html',
  styleUrl: './message-inbox.css'
})
export class MessageInbox implements OnInit {
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  conversations = signal<MessageDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  currentUserId = this.authService.getUserId();

  ngOnInit(): void {
    this.load(true);

    // Aggiorna la lista periodicamente, senza ricaricare la pagina.
    interval(POLL_INTERVAL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(false));
  }

  private load(showLoadingState: boolean): void {
    this.messageService.getMine().subscribe({
      next: (messages) => {
        this.conversations.set(messages);
        if (showLoadingState) this.loading.set(false);
      },
      error: () => {
        if (showLoadingState) {
          this.errorMessage.set('Impossibile caricare le conversazioni.');
          this.loading.set(false);
        }
      }
    });
  }

  isUnread(message: MessageDto): boolean {
    return message.readAt === null && message.senderId !== this.currentUserId;
  }
}
