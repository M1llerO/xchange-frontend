import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { buildParams } from '../core/http-params.util';
import {
  CreateListingRequest,
  ListingDto,
  ListingSearchDto,
  ListingSearchParams,
  ListingStatus
} from '../models/listing.model';

@Injectable({ providedIn: 'root' })
export class ListingService {
  private baseUrl = `${environment.apiUrl}/listings`;

  constructor(private http: HttpClient) {}

  create(data: CreateListingRequest) {
    return this.http.post<ListingDto>(this.baseUrl, data);
  }

  getMine() {
    return this.http.get<ListingDto[]>(`${this.baseUrl}/mine`);
  }

  search(params?: ListingSearchParams) {
    return this.http.get<ListingSearchDto[]>(this.baseUrl, { params: buildParams({ ...params }) });
  }

  updateStatus(id: number, status: ListingStatus) {
    return this.http.patch<ListingDto>(`${this.baseUrl}/${id}/status`, { status });
  }
}
