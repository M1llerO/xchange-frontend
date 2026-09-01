import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { buildParams } from '../core/http-params.util';
import { CreateReportRequest, ReportDto, ReportStatus, ReviewReportRequest } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private baseUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  getMine() {
    return this.http.get<ReportDto[]>(`${this.baseUrl}/mine`);
  }

  getAll(status?: ReportStatus) {
    return this.http.get<ReportDto[]>(this.baseUrl, { params: buildParams({ status }) });
  }

  getById(id: number) {
    return this.http.get<ReportDto>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateReportRequest) {
    return this.http.post<ReportDto>(this.baseUrl, data);
  }

  review(id: number, data: ReviewReportRequest) {
    return this.http.patch<ReportDto>(`${this.baseUrl}/${id}/review`, data);
  }
}
