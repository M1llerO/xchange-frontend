import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report';
import { ReportDto, ReportStatus } from '../../../models/report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  reports = signal<ReportDto[]>([]);
  selectedReport = signal<ReportDto | null>(null);
  filterStatus = signal<ReportStatus | ''>('');
  loading = signal(false);
  reviewStatus = signal<ReportStatus | ''>('');
  reviewNote = signal('');
  showReviewForm = signal(false);

  readonly statuses: ReportStatus[] = ['aperta', 'in_revisione', 'risolta', 'respinta'];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    const status = this.filterStatus() as ReportStatus | undefined;
    this.reportService.getAll(status).subscribe({
      next: (data) => {
        this.reports.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFilterChange(): void {
    this.loadReports();
  }

  viewDetail(report: ReportDto): void {
    this.selectedReport.set(report);
  }

  closeDetail(): void {
    this.selectedReport.set(null);
    this.showReviewForm.set(false);
    this.reviewStatus.set('');
    this.reviewNote.set('');
  }

  openReviewForm(): void {
    this.showReviewForm.set(true);
  }

  submitReview(): void {
    const report = this.selectedReport();
    if (!report || !this.reviewStatus()) return;

    this.reportService.review(report.id, {
      status: this.reviewStatus() as Exclude<ReportStatus, 'aperta'>,
      resolutionNote: this.reviewNote() || null
    }).subscribe({
      next: (updated) => {
        this.selectedReport.set(updated);
        this.showReviewForm.set(false);
        this.loadReports();
      }
    });
  }

  getStatusColor(status: ReportStatus): string {
    switch (status) {
      case 'aperta': return '#ffc107';
      case 'in_revisione': return '#17a2b8';
      case 'risolta': return '#28a745';
      case 'respinta': return '#dc3545';
      default: return '#999';
    }
  }
}
