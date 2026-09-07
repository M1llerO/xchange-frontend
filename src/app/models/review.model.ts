export type { ReviewSummaryDto } from './user.model';

export interface CreateReviewDto {
  exchangeId: number;
  rating: number;
  comment?: string | null;
}
