import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ExchangeDto } from '../models/exchange.model';

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private baseUrl = `${environment.apiUrl}/exchanges`;

  constructor(private http: HttpClient) {}

  getMine() {
    return this.http.get<ExchangeDto[]>(`${this.baseUrl}/mine`);
  }

  getById(id: number) {
    return this.http.get<ExchangeDto>(`${this.baseUrl}/${id}`);
  }

  confirm(id: number) {
    return this.http.patch<ExchangeDto>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancel(id: number) {
    return this.http.patch<ExchangeDto>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
