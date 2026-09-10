export type ExchangeStatus = 'in_corso' | 'completato' | 'annullato';
export type ExchangeMethod = 'di_persona' | 'spedizione';

export interface ExchangeDto {
  id: number;
  offerId: number;
  listingId: number;
  ownerId: number;
  offererId: number;
  status: ExchangeStatus;
  ownerConfirmedAt: string | null;
  offererConfirmedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  reviewedByMe: boolean;
  location: string | null;
  method: ExchangeMethod | null;
}

export interface UpdateExchangeLogisticsRequest {
  location?: string;
  method?: ExchangeMethod;
}
