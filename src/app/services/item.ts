import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { buildParams } from '../core/http-params.util';
import { CreateItemRequest, ItemDto, ItemQueryParams, UpdateItemRequest } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private baseUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  getAll(params?: ItemQueryParams) {
    return this.http.get<ItemDto[]>(this.baseUrl, { params: buildParams({ ...params }) });
  }

  getById(id: number) {
    return this.http.get<ItemDto>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateItemRequest) {
    return this.http.post<ItemDto>(this.baseUrl, data);
  }

  update(id: number, data: UpdateItemRequest) {
    return this.http.put<ItemDto>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
