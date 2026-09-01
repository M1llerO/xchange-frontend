import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserProfileDto } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(id: number) {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/${id}/profile`);
  }
}
