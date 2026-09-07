import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CounterOfferRequest, MakeOfferRequest, OfferDto } from '../models/offer.model';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  makeOffer(listingId: number, data: MakeOfferRequest) {
    return this.http.post<OfferDto>(`${this.baseUrl}/listings/${listingId}/offers`, data);
  }

  getSent() {
    return this.http.get<OfferDto[]>(`${this.baseUrl}/offers/sent`);
  }

  getReceived() {
    return this.http.get<OfferDto[]>(`${this.baseUrl}/offers/received`);
  }

  approve(offerId: number) {
    return this.http.patch<OfferDto>(`${this.baseUrl}/offers/${offerId}/approve`, {});
  }

  counter(offerId: number, data: CounterOfferRequest) {
    return this.http.post<OfferDto>(`${this.baseUrl}/offers/${offerId}/counter`, data);
  }
}
