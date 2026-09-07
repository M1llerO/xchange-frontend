import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ItemImageDto } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemImageService {
  private baseUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  list(itemId: number) {
    return this.http.get<ItemImageDto[]>(`${this.baseUrl}/${itemId}/images`);
  }

  upload(itemId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ItemImageDto>(`${this.baseUrl}/${itemId}/images`, formData);
  }

  reorder(itemId: number, imageIds: number[]) {
    return this.http.patch<ItemImageDto[]>(`${this.baseUrl}/${itemId}/images/order`, { imageIds });
  }

  remove(itemId: number, imageId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${itemId}/images/${imageId}`);
  }
}
