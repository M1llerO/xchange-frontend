import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { OfferService } from '../../../services/offer';
import { AuthService } from '../../../services/auth';
import { OfferDto } from '../../../models/offer.model';
import { resolveAssetUrl } from '../../../core/asset-url.util';
import { CONDITION_LABELS } from '../../items/item.constants';
import { CounterOfferModal } from '../counter-offer-modal/counter-offer-modal';

type OfferTab = 'received' | 'sent';

@Component({
  selector: 'app-my-offers',
  imports: [CommonModule, CounterOfferModal],
  templateUrl: './my-offers.html',
  styleUrl: './my-offers.css'
})
export class MyOffers implements OnInit {
  private offerService = inject(OfferService);
  private authService = inject(AuthService);

  currentUserId = this.authService.getUserId();
  readonly conditionLabels = CONDITION_LABELS;

  private allOffers = signal<OfferDto[]>([]);
  activeTab = signal<OfferTab>('received');
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  counterOfferTargetId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      received: this.offerService.getReceived(),
      sent: this.offerService.getSent()
    }).subscribe({
      next: ({ received, sent }) => {
        // Le due liste del backend si sovrappongono (una stessa trattativa può
        // comparire in entrambe): uniamo ed eliminiamo i duplicati per offerId.
        const byId = new Map<number, OfferDto>();
        for (const offer of [...received, ...sent]) {
          byId.set(offer.offerId, offer);
        }
        this.allOffers.set([...byId.values()]);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare le offerte.');
        this.loading.set(false);
      }
    });
  }

  setTab(tab: OfferTab): void {
    this.activeTab.set(tab);
  }

  itemImageUrl(imageUrl: string | null): string {
    return resolveAssetUrl(imageUrl);
  }

  // Una controproposta creata dalla controparte va mostrata tra le "ricevute"
  // anche se il thread era nato da un'offerta che io stesso avevo inviato:
  // ciò che conta è chi ha creato l'ultima riga, non la direzione originale.
  visibleOffers(): OfferDto[] {
    return this.allOffers().filter((offer) =>
      this.activeTab() === 'received'
        ? offer.createdById !== this.currentUserId
        : offer.createdById === this.currentUserId
    );
  }

  // Con le controproposte il ruolo si inverte: chi non ha creato l'offerta
  // pendente deve rispondere, solo chi l'ha creata può annullarla.
  awaitingMyResponse(offer: OfferDto): boolean {
    return offer.status === 'in_attesa' && offer.createdById !== this.currentUserId;
  }

  canCancel(offer: OfferDto): boolean {
    return offer.status === 'in_attesa' && offer.createdById === this.currentUserId;
  }

  approve(offerId: number): void {
    this.offerService.approve(offerId).subscribe({
      next: () => this.loadOffers(),
      error: () => this.errorMessage.set("Impossibile accettare l'offerta.")
    });
  }

  reject(offerId: number): void {
    this.offerService.reject(offerId).subscribe({
      next: () => this.loadOffers(),
      error: () => this.errorMessage.set("Impossibile rifiutare l'offerta.")
    });
  }

  cancel(offerId: number): void {
    this.offerService.cancel(offerId).subscribe({
      next: () => this.loadOffers(),
      error: () => this.errorMessage.set("Impossibile annullare l'offerta.")
    });
  }

  openCounterModal(offerId: number): void {
    this.counterOfferTargetId.set(offerId);
  }

  closeCounterModal(): void {
    this.counterOfferTargetId.set(null);
  }

  onCounterSubmitted(): void {
    this.counterOfferTargetId.set(null);
    this.loadOffers();
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      in_attesa: 'In attesa',
      accettata: 'Accettata',
      rifiutata: 'Rifiutata',
      annullata: 'Annullata',
      controproposta: 'Controproposta'
    };
    return labels[status] ?? status;
  }
}