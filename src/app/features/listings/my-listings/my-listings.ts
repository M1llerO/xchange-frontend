
import { ListingService } from '../../../services/listing';
import { Listing } from '../../../models/listing.model';
import { extractErrorMessage } from '../../../core/api-error.util';
import { Component, OnInit, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-my-listings',
  styleUrl: './my-listings.css',
  templateUrl: './my-listings.html',
})
export class MyListings implements OnInit {

 constructor(private listingService: ListingService) {}

 listings: Listing[] = [];
 loading = signal(true);
 errorMessage = signal<string | null>(null);

 statusLabels: Record<string, string> = {
   attivo: 'Attivo',
   in_trattativa: 'In trattativa',
   scambiato: 'Scambiato',
   eliminato: 'Eliminato'
 };

  ngOnInit() {
    this.listingService.getMine().subscribe({
      next: (listings) => {
        this.listings = listings;
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare i tuoi annunci.');
        this.loading.set(false);
      }
    });
  }

  cancelListing(listing: Listing) {
  this.errorMessage.set(null);
  this.listingService.updateStatus(listing.id, 'eliminato').subscribe({
    next: () => {
      this.listings = this.listings.map(l =>
        l.id === listing.id ? { ...l, status: 'eliminato' } : l
      );
    },
    error: (err) => this.errorMessage.set(extractErrorMessage(err, "Impossibile eliminare l'annuncio."))
  });
}

}
