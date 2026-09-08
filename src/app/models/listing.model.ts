export type ListingStatus = 'attivo' | 'in_trattativa' | 'scambiato' | 'eliminato';

export interface Listing {
id: number;
itemId: number;
ownerId: number;
city: string;
publishedAt: string;
updatedAt: string;
acceptedCategoryIds: number[];
status: ListingStatus;

}

export interface CreateListingRequest {
    itemId: number;
    city: string;
    acceptedCategoryIds: number[];
}

export interface UpdateListingStatusRequest {
    status: ListingStatus;
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
