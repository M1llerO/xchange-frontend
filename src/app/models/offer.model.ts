import { ItemCondition } from './item.model';

export type OfferStatus = 'in_attesa' | 'accettata' | 'rifiutata' | 'annullata' | 'controproposta';

export interface OfferedItemDto {
  id: number;
  title: string;
  condition: ItemCondition;
  estimatedValue: number | null;
  imageUrl: string | null;
}

export interface OfferDto {
  offerId: number;
  offererId: number;
  offererName: string;
  offeredItems: OfferedItemDto[];
  message: string | null;
  status: OfferStatus;
}

export interface MakeOfferRequest {
  itemIds: number[];
  message?: string | null;
}

export type CounterOfferRequest = MakeOfferRequest;
