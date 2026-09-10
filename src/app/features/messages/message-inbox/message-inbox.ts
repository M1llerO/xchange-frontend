import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, interval } from 'rxjs';
import { MessageService } from '../../../services/message';
import { AuthService } from '../../../services/auth';
import { OfferService } from '../../../services/offer';
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
  private offerService = inject(OfferService);
  private destroyRef = inject(DestroyRef);

  conversations = signal<MessageDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  currentUserId = this.authService.getUserId();

  // offerId -> titolo dell'oggetto proposto in quella trattativa, per mostrarlo
  // al posto di "Trattativa #N". Segnale (non un campo semplice) perché l'app
  // gira in modalità zoneless: un campo mutato dentro una subscribe HTTP non
  // farebbe mai ripartire il render.
  private itemTitles = signal(new Map<number, string>());

  ngOnInit(): void {
    this.load(true);
    this.loadItemTitles();

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

  private loadItemTitles(): void {
    forkJoin({
      received: this.offerService.getReceived(),
      sent: this.offerService.getSent()
    }).subscribe({
      next: ({ received, sent }) => {
        const map = new Map<number, string>();
        for (const offer of [...received, ...sent]) {
          const title = offer.offeredItems.map((item) => item.title).join(' + ');
          if (title) map.set(offer.offerId, title);
        }
        this.itemTitles.set(map);
      },
      error: () => {}
    });
  }

  threadLabel(offerId: number): string {
    return this.itemTitles().get(offerId) ?? `Trattativa #${offerId}`;
  }

  isUnread(message: MessageDto): boolean {
    return message.readAt === null && message.senderId !== this.currentUserId;
  }
}
