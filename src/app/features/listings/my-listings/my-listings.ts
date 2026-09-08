
import { ListingsService } from '../../../services/listing.services';
import { Listing, ListingStatus } from '../../../models/listing.model';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-my-listings',
  styleUrl: './my-listings.css',
  templateUrl: './my-listings.html',
})
export class MyListings implements OnInit {
  
 constructor(private listingsService: ListingsService) {}
 
 listings: Listing[] = [];

  ngOnInit() {
    this.listingsService.getMine().subscribe((listings) => {
      this.listings = listings;
    });
  }

  cancelListing(listing: Listing) {
  this.listingsService.updateStatus(listing.id, { status: 'eliminato' }).subscribe(() => {
    this.listings = this.listings.map(l =>
      l.id === listing.id ? { ...l, status: 'eliminato' } : l
    );
  });
}

  
}



  



