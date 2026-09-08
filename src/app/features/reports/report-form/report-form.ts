import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../services/report';
import { extractErrorMessage } from '../../../core/api-error.util';
import { ReportDto, ReportReason } from '../../../models/report.model';

@Component({
  selector: 'app-report-form',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './report-form.html',
  styleUrl: './report-form.css'
})
export class ReportForm {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);
  private fb = inject(FormBuilder);

  private queryParams = this.route.snapshot.queryParamMap;
  targetUserId = this.queryParams.get('userId') ? Number(this.queryParams.get('userId')) : null;
  targetListingId = this.queryParams.get('listingId') ? Number(this.queryParams.get('listingId')) : null;

  reasons: ReportReason[] = ['spam', 'contenuto_offensivo', 'truffa', 'oggetto_illegale', 'profilo_falso', 'altro'];
  reasonLabels: Record<ReportReason, string> = {
    spam: 'Spam',
    contenuto_offensivo: 'Contenuto offensivo',
    truffa: 'Truffa',
    oggetto_illegale: 'Oggetto illegale',
    profilo_falso: 'Profilo falso',
    altro: 'Altro'
  };

  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal<ReportDto | null>(null);

  form = this.fb.nonNullable.group({
    reason: ['spam' as ReportReason, [Validators.required]],
    description: ['', [Validators.maxLength(1000)]]
  });

  submit(): void {
    if (this.form.invalid || this.submitting() || (!this.targetUserId && !this.targetListingId)) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const { reason, description } = this.form.getRawValue();
    this.reportService
      .create({
        reason,
        description: description || null,
        reportedUserId: this.targetUserId,
        reportedListingId: this.targetListingId
      })
      .subscribe({
        next: (report) => {
          this.submitted.set(report);
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, 'Impossibile inviare la segnalazione.'));
          this.submitting.set(false);
        }
      });
  }
}
