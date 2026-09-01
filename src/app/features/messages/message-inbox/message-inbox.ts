import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MessageService } from '../../../services/message';
import { AuthService } from '../../../services/auth';
import { MessageDto } from '../../../models/message.model';

@Component({
  selector: 'app-message-inbox',
  imports: [CommonModule, RouterLink],
  templateUrl: './message-inbox.html',
  styleUrl: './message-inbox.css'
})
export class MessageInbox implements OnInit {
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  conversations = signal<MessageDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  currentUserId = this.authService.getUserId();

  ngOnInit(): void {
    this.messageService.getMine().subscribe({
      next: (messages) => {
        this.conversations.set(messages);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare le conversazioni.');
        this.loading.set(false);
      }
    });
  }

  isUnread(message: MessageDto): boolean {
    return message.readAt === null && message.senderId !== this.currentUserId;
  }
}
