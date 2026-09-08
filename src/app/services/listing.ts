import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { buildParams } from '../core/http-params.util';
import {
  CreateListingRequest,
  Listing,
  ListingDetailDto,
  ListingSearchDto,
  ListingStatus
} from '../models/listing.model';

type ListingSearchParams = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ListingService {
  private baseUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  create(data: CreateListingRequest) {
    return this.http.post<Listing>(this.baseUrl, data);
  }

  getMine() {
    return this.http.get<Listing[]>(`${this.baseUrl}/mine`);
  }

  getById(id: number) {
    return this.http.get<ListingDetailDto>(`${this.baseUrl}/${id}`);
  }

  search(params?: ListingSearchParams) {
    return this.http.get<ListingSearchDto[]>(this.baseUrl, { params: buildParams({ ...params }) });
  }

  updateStatus(id: number, status: ListingStatus) {
    return this.http.patch<Listing>(`${this.baseUrl}/${id}/status`, { status });
  }
}
