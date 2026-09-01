import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CreateReviewDto, ReviewSummaryDto } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private baseUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  create(data: CreateReviewDto) {
    return this.http.post<ReviewSummaryDto>(this.baseUrl, data);
  }
}
