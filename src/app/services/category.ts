import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private baseUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Category[]>(this.baseUrl);
  }

  getById(id: number) {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(data: { name: string; slug: string; description?: string }) {
    return this.http.post<Category>(this.baseUrl, data);
  }

  update(id: number, data: Partial<Category>) {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, data);
  }

  deactivate(id: number) {
    return this.http.patch<Category>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  activate(id: number) {
    return this.http.patch<Category>(`${this.baseUrl}/${id}/activate`, {});
  }
}