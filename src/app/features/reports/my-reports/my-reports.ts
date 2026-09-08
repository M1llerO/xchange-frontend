import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report';
import { ReportDto } from '../../../models/report.model';

@Component({
  selector: 'app-my-reports',
  imports: [CommonModule],
  templateUrl: './my-reports.html',
  styleUrl: './my-reports.css'
})
export class MyReports implements OnInit {
  private reportService = inject(ReportService);

  reports = signal<ReportDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  statusLabels: Record<string, string> = {
    aperta: 'Aperta',
    in_revisione: 'In revisione',
    risolta: 'Risolta',
    respinta: 'Respinta'
  };

  ngOnInit(): void {
    this.reportService.getMine().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare le segnalazioni.');
        this.loading.set(false);
      }
    });
  }
}
