export type ExchangeStatus = 'in_corso' | 'completato' | 'annullato';

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
}
