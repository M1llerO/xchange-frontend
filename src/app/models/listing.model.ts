export type ListingStatus = 'attivo' | 'in_trattativa' | 'scambiato' | 'eliminato';

export interface ListingDto {
  id: number;
  itemId: number;
  ownerId: number;
  city: string;
  status: ListingStatus;
  publishedAt: string;
  updatedAt: string;
  acceptedCategoryIds: number[];
}

export interface ListingSearchDto {
  id: number;
  city: string;
  status: ListingStatus;
  publishedAt: string;
  itemId: number;
  itemTitle: string;
  itemDescription: string;
  itemEstimatedValue: number | null;
  categoryId: number;
  categoryName: string;
  primaryImageUrl: string | null;
}

export interface CreateListingRequest {
  city: string;
  acceptedCategoryIds: number[];
  itemId: number;
}

export interface ListingSearchParams {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}
