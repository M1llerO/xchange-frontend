import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from '../../../services/message';
import { AuthService } from '../../../services/auth';
import { MessageDto } from '../../../models/message.model';
import { extractErrorMessage } from '../../../core/api-error.util';

@Component({
  selector: 'app-message-thread',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './message-thread.html',
  styleUrl: './message-thread.css'
})
export class MessageThread implements OnInit {
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  offerId = Number(this.route.snapshot.paramMap.get('offerId'));
  currentUserId = this.authService.getUserId();

  messages = signal<MessageDto[]>([]);
  loading = signal(true);
  sending = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    this.messageService.getThread(this.offerId).subscribe({
      next: (messages) => {
        this.messages.set(messages);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare la conversazione.');
        this.loading.set(false);
      }
    });
  }

  otherParticipantName(): string | null {
    const other = this.messages().find((m) => m.senderId !== this.currentUserId);
    return other?.senderUsername ?? null;
  }

  isMine(message: MessageDto): boolean {
    return message.senderId === this.currentUserId;
  }

  send(): void {
    if (this.form.invalid || this.sending()) {
      return;
    }
    this.sending.set(true);
    this.errorMessage.set(null);
    this.messageService.send(this.offerId, this.form.getRawValue()).subscribe({
      next: (message) => {
        this.messages.update((list) => [...list, message]);
        this.form.reset({ body: '' });
        this.sending.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile inviare il messaggio.'));
        this.sending.set(false);
      }
    });
  }

  remove(message: MessageDto): void {
    this.messageService.delete(message.id).subscribe({
      next: () => {
        this.messages.update((list) => list.filter((m) => m.id !== message.id));
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile eliminare il messaggio.'));
      }
    });
  }
}
