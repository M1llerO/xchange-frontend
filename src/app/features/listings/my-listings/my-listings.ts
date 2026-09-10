
import { ListingService } from '../../../services/listing';
import { OfferService } from '../../../services/offer';
import { Listing } from '../../../models/listing.model';
import { OfferDto } from '../../../models/offer.model';
import { extractErrorMessage } from '../../../core/api-error.util';
import { resolveAssetUrl } from '../../../core/asset-url.util';
import { CONDITION_LABELS } from '../../items/item.constants';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  imports: [RouterLink],
  selector: 'app-my-listings',
  styleUrl: './my-listings.css',
  templateUrl: './my-listings.html',
})
export class MyListings implements OnInit {

 constructor(
   private listingService: ListingService,
   private offerService: OfferService
 ) {}

 // Segnali (non campi semplici) perché l'app gira in modalità zoneless: un
 // campo mutato dentro una subscribe HTTP non farebbe mai ripartire il render.
 listings = signal<Listing[]>([]);
 loading = signal(true);
 errorMessage = signal<string | null>(null);

 readonly resolveAssetUrl = resolveAssetUrl;
 readonly conditionLabels = CONDITION_LABELS;

 // Offerte pendenti raggruppate per annuncio, per mostrare l'oggetto proposto
 // in cambio direttamente nella scheda del proprio annuncio.
 private pendingOffersByListing = signal(new Map<number, OfferDto[]>());

 statusLabels: Record<string, string> = {
   attivo: 'Attivo',
   in_trattativa: 'In trattativa',
   scambiato: 'Scambiato',
   eliminato: 'Eliminato'
 };

  ngOnInit() {
    forkJoin({
      listings: this.listingService.getMine(),
      received: this.offerService.getReceived(),
      sent: this.offerService.getSent()
    }).subscribe({
      next: ({ listings, received, sent }) => {
        this.listings.set(listings);

        const byId = new Map<number, OfferDto>();
        for (const offer of [...received, ...sent]) {
          byId.set(offer.offerId, offer);
        }
        const grouped = new Map<number, OfferDto[]>();
        for (const offer of byId.values()) {
          if (offer.status !== 'in_attesa' || offer.listingId === undefined) continue;
          const list = grouped.get(offer.listingId) ?? [];
          list.push(offer);
          grouped.set(offer.listingId, list);
        }
        this.pendingOffersByListing.set(grouped);

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare i tuoi annunci.');
        this.loading.set(false);
      }
    });
  }

  pendingOffersFor(listing: Listing): OfferDto[] {
    return this.pendingOffersByListing().get(listing.id) ?? [];
  }

  itemImage(listing: Listing): string {
    return this.resolveAssetUrl(listing.primaryImageUrl);
  }

  cancelListing(listing: Listing) {
  this.errorMessage.set(null);
  this.listingService.updateStatus(listing.id, 'eliminato').subscribe({
    next: () => {
      this.listings.update((list) =>
        list.map((l) => (l.id === listing.id ? { ...l, status: 'eliminato' } : l))
      );
    },
    error: (err) => this.errorMessage.set(extractErrorMessage(err, "Impossibile eliminare l'annuncio."))
  });
}

}
