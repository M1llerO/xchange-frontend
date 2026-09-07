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
