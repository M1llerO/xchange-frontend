import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../../../services/review';
import { extractErrorMessage } from '../../../core/api-error.util';
import { ReviewSummaryDto } from '../../../models/review.model';

@Component({
  selector: 'app-review-form',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './review-form.html',
  styleUrl: './review-form.css'
})
export class ReviewForm {
  private route = inject(ActivatedRoute);
  private reviewService = inject(ReviewService);
  private fb = inject(FormBuilder);

  exchangeId = Number(this.route.snapshot.paramMap.get('exchangeId'));
  ratings = [1, 2, 3, 4, 5];

  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  submitted = signal<ReviewSummaryDto | null>(null);

  form = this.fb.nonNullable.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.maxLength(1000)]]
  });

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const { rating, comment } = this.form.getRawValue();
    this.reviewService
      .create({ exchangeId: this.exchangeId, rating, comment: comment || null })
      .subscribe({
        next: (review) => {
          this.submitted.set(review);
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, 'Impossibile inviare la recensione.'));
          this.submitting.set(false);
        }
      });
  }
}
