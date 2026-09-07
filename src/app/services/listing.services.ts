import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Listing, CreateListingRequest, UpdateListingStatusRequest, ListingStatus } from '../models/listing.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ListingsService {

      private baseUrl = `${environment.apiUrl}/listings`;

 constructor(private http: HttpClient) {}

    getMine() {
        return this.http.get<Listing[]>(`${this.baseUrl}/mine`);
    }

   create(request: CreateListingRequest) {
  return this.http.post<Listing>(this.baseUrl, request);
    }

updateStatus(id: number, request: UpdateListingStatusRequest) {
  return this.http.patch<Listing>(`${this.baseUrl}/${id}/status`, request);
}




 }
