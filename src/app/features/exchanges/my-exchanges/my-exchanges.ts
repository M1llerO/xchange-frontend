import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ExchangeService } from '../../../services/exchange';
import { AuthService } from '../../../services/auth';
import { ListingService } from '../../../services/listing';
import { OfferService } from '../../../services/offer';
import { extractErrorMessage } from '../../../core/api-error.util';
import { resolveAssetUrl } from '../../../core/asset-url.util';
import { ExchangeDto, ExchangeMethod } from '../../../models/exchange.model';

export const EXCHANGE_METHOD_LABELS: Record<ExchangeMethod, string> = {
  di_persona: 'Di persona',
  spedizione: 'Spedizione'
};

interface ItemPreview {
  title: string;
  imageUrl: string | null;
}

@Component({
  selector: 'app-my-exchanges',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-exchanges.html',
  styleUrl: './my-exchanges.css'
})
export class MyExchanges implements OnInit {
  private exchangeService = inject(ExchangeService);
  private authService = inject(AuthService);
  private listingService = inject(ListingService);
  private offerService = inject(OfferService);

  readonly methodLabels = EXCHANGE_METHOD_LABELS;
  readonly methodOptions: ExchangeMethod[] = ['di_persona', 'spedizione'];
  readonly resolveAssetUrl = resolveAssetUrl;

  // id scambio -> anteprima dei due oggetti coinvolti (annuncio e offerta accettata).
  // Segnali (non semplici campi) perché l'app gira in modalità zoneless: un
  // campo mutato dentro una subscribe HTTP non farebbe mai ripartire il render.
  private listingPreviews = signal(new Map<number, ItemPreview>());
  private offerPreviews = signal(new Map<number, ItemPreview>());

  exchanges = signal<ExchangeDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  actingId = signal<number | null>(null);

  editingLogisticsId = signal<number | null>(null);
  draftLocation = signal('');
  draftMethod = signal<ExchangeMethod | ''>('');

  currentUserId = this.authService.getUserId();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.exchangeService.getMine().subscribe({
      next: (exchanges) => {
        this.exchanges.set(exchanges);
        this.loading.set(false);
        this.loadItemPreviews(exchanges);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare gli scambi.');
        this.loading.set(false);
      }
    });
  }

  private loadItemPreviews(exchanges: ExchangeDto[]): void {
    if (exchanges.length === 0) return;

    forkJoin({
      listings: forkJoin(exchanges.map((e) => this.listingService.getById(e.listingId))),
      received: this.offerService.getReceived(),
      sent: this.offerService.getSent()
    }).subscribe({
      next: ({ listings, received, sent }) => {
        const offerById = new Map([...received, ...sent].map((o) => [o.offerId, o]));
        const listingMap = new Map<number, ItemPreview>();
        const offerMap = new Map<number, ItemPreview>();

        exchanges.forEach((exchange, index) => {
          const listing = listings[index];
          listingMap.set(exchange.id, {
            title: listing.itemTitle,
            imageUrl: listing.images[0]?.url ?? null
          });

          const offer = offerById.get(exchange.offerId);
          if (offer && offer.offeredItems.length > 0) {
            offerMap.set(exchange.id, {
              title: offer.offeredItems.map((item) => item.title).join(' + '),
              imageUrl: offer.offeredItems[0].imageUrl
            });
          }
        });

        this.listingPreviews.set(listingMap);
        this.offerPreviews.set(offerMap);
      },
      error: () => {
        // le anteprime sono un arricchimento visivo: se falliscono, la pagina
        // resta comunque utilizzabile senza immagini/titoli degli oggetti
      }
    });
  }

  listingPreview(exchange: ExchangeDto): ItemPreview | null {
    return this.listingPreviews().get(exchange.id) ?? null;
  }

  offerPreview(exchange: ExchangeDto): ItemPreview | null {
    return this.offerPreviews().get(exchange.id) ?? null;
  }

  counterpartId(exchange: ExchangeDto): number {
    return exchange.ownerId === this.currentUserId ? exchange.offererId : exchange.ownerId;
  }

  hasConfirmed(exchange: ExchangeDto): boolean {
    return exchange.ownerId === this.currentUserId
      ? exchange.ownerConfirmedAt !== null
      : exchange.offererConfirmedAt !== null;
  }

  private isOwner(exchange: ExchangeDto): boolean {
    return exchange.ownerId === this.currentUserId;
  }

  logisticsSet(exchange: ExchangeDto): boolean {
    return !!exchange.location && !!exchange.method;
  }

  myLogisticsConfirmed(exchange: ExchangeDto): boolean {
    return this.isOwner(exchange) ? exchange.logisticsConfirmedByOwner : exchange.logisticsConfirmedByOfferer;
  }

  counterpartLogisticsConfirmed(exchange: ExchangeDto): boolean {
    return this.isOwner(exchange) ? exchange.logisticsConfirmedByOfferer : exchange.logisticsConfirmedByOwner;
  }

  canConfirmDelivery(exchange: ExchangeDto): boolean {
    return this.logisticsSet(exchange) && exchange.logisticsConfirmedByOwner && exchange.logisticsConfirmedByOfferer;
  }

  confirmLogistics(exchange: ExchangeDto): void {
    this.act(exchange.id, () =>
      this.exchangeService.confirmLogistics(exchange.id).subscribe({
        next: (updated) => this.replace(updated),
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, 'Impossibile confermare luogo e metodo.'));
          this.actingId.set(null);
        }
      })
    );
  }

  confirm(exchange: ExchangeDto): void {
    this.act(exchange.id, () =>
      this.exchangeService.confirm(exchange.id).subscribe({
        next: (updated) => this.replace(updated),
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, 'Impossibile confermare lo scambio.'));
          this.actingId.set(null);
        }
      })
    );
  }

  cancel(exchange: ExchangeDto): void {
    this.act(exchange.id, () =>
      this.exchangeService.cancel(exchange.id).subscribe({
        next: (updated) => this.replace(updated),
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, 'Impossibile annullare lo scambio.'));
          this.actingId.set(null);
        }
      })
    );
  }

  startEditLogistics(exchange: ExchangeDto): void {
    this.errorMessage.set(null);
    this.editingLogisticsId.set(exchange.id);
    this.draftLocation.set(exchange.location ?? '');
    this.draftMethod.set(exchange.method ?? '');
  }

  cancelEditLogistics(): void {
    this.editingLogisticsId.set(null);
  }

  saveLogistics(exchange: ExchangeDto): void {
    const location = this.draftLocation().trim();
    const method = this.draftMethod();

    if (!location && !method) {
      this.errorMessage.set('Indica almeno il luogo o il metodo di scambio.');
      return;
    }

    this.act(exchange.id, () =>
      this.exchangeService
        .updateLogistics(exchange.id, {
          ...(location ? { location } : {}),
          ...(method ? { method } : {})
        })
        .subscribe({
          next: (updated) => {
            this.replace(updated);
            this.editingLogisticsId.set(null);
          },
          error: (err) => {
            this.errorMessage.set(extractErrorMessage(err, 'Impossibile salvare i dettagli dello scambio.'));
            this.actingId.set(null);
          }
        })
    );
  }

  private act(id: number, action: () => void): void {
    this.actingId.set(id);
    this.errorMessage.set(null);
    action();
  }

  private replace(updated: ExchangeDto): void {
    this.exchanges.update((list) => list.map((e) => (e.id === updated.id ? updated : e)));
    this.actingId.set(null);
  }
}
