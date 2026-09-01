export interface ReviewSummaryDto {
  id: number;
  authorId: number;
  authorUsername: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface UserProfileDto {
  userId: number;
  username: string;
  averageRating: number | null;
  reviewsCount: number;
  reviews: ReviewSummaryDto[];
}
