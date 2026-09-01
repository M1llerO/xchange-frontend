import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

interface JwtClaims {
  sub: string;
  uid: number;
  roles: string[];
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(tap(res => this.saveToken(res.token)));
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isExpired(token);
  }

  getClaims(): JwtClaims | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<JwtClaims>(token);
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    return this.getClaims()?.uid ?? null;
  }

  getUsername(): string | null {
    return this.getClaims()?.sub ?? null;
  }

  hasRole(role: string): boolean {
    return this.getClaims()?.roles.includes(role) ?? false;
  }

  private isExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode<JwtClaims>(token);
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }
}