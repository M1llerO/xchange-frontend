
import { ListingService } from '../../../services/listing';
import { Listing } from '../../../models/listing.model';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-my-listings',
  styleUrl: './my-listings.css',
  templateUrl: './my-listings.html',
})
export class MyListings implements OnInit {

 constructor(private listingService: ListingService) {}

 listings: Listing[] = [];

  ngOnInit() {
    this.listingService.getMine().subscribe((listings) => {
      this.listings = listings;
    });
  }

  cancelListing(listing: Listing) {
  this.listingService.updateStatus(listing.id, 'eliminato').subscribe(() => {
    this.listings = this.listings.map(l =>
      l.id === listing.id ? { ...l, status: 'eliminato' } : l
    );
  });
}

}



  



