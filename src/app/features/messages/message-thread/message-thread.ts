import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, interval } from 'rxjs';
import { MessageService } from '../../../services/message';
import { AuthService } from '../../../services/auth';
import { OfferService } from '../../../services/offer';
import { NotificationService } from '../../../services/notification';
import { MessageDto } from '../../../models/message.model';
import { extractErrorMessage } from '../../../core/api-error.util';

const POLL_INTERVAL_MS = 4000;

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
  private offerService = inject(OfferService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  offerId = signal(0);
  currentUserId = this.authService.getUserId();

  messages = signal<MessageDto[]>([]);
  loading = signal(true);
  sending = signal(false);
  errorMessage = signal<string | null>(null);
  threadItemTitle = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const offerId = Number(params.get('offerId'));
      this.offerId.set(offerId);
      this.messages.set([]);
      this.threadItemTitle.set(null);
      this.errorMessage.set(null);
      this.loading.set(true);
      this.loadThread(offerId, true);
      this.loadThreadItemTitle(offerId);
    });

    // Aggiorna la conversazione periodicamente, senza ricaricare la pagina.
    interval(POLL_INTERVAL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadThread(this.offerId(), false));
  }

  // Le conversazioni sono sempre agganciate all'offerta "radice" della
  // trattativa: recuperiamo il titolo degli oggetti proposti in quella prima
  // offerta per mostrarlo come titolo della chat invece di "Trattativa #N".
  private loadThreadItemTitle(offerId: number): void {
    if (!offerId) return;
    forkJoin({
      received: this.offerService.getReceived(),
      sent: this.offerService.getSent()
    }).subscribe({
      next: ({ received, sent }) => {
        const offer = [...received, ...sent].find((o) => o.offerId === offerId);
        const title = offer?.offeredItems.map((item) => item.title).join(' + ') ?? null;
        this.threadItemTitle.set(title || null);
      },
      error: () => {}
    });
  }

  private loadThread(offerId: number, showLoadingState: boolean): void {
    if (!offerId) return;
    this.messageService.getThread(offerId).subscribe({
      next: (messages) => {
        this.messages.set(messages);
        if (showLoadingState) this.loading.set(false);
        this.notificationService.refresh();
      },
      error: () => {
        if (showLoadingState) {
          this.errorMessage.set('Impossibile caricare la conversazione.');
          this.loading.set(false);
        }
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
    this.messageService.send(this.offerId(), this.form.getRawValue()).subscribe({
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
