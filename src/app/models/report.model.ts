export type ReportReason =
  | 'spam'
  | 'contenuto_offensivo'
  | 'truffa'
  | 'oggetto_illegale'
  | 'profilo_falso'
  | 'altro';

export type ReportStatus = 'aperta' | 'in_revisione' | 'risolta' | 'respinta';

export interface ReportDto {
  id: number;
  reporterId: number;
  reporterUsername: string;
  reportedUserId: number | null;
  reportedUsername: string | null;
  reportedListingId: number | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  reviewedById: number | null;
  reviewedByUsername: string | null;
  reviewedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface CreateReportRequest {
  reason: ReportReason;
  description?: string | null;
  reportedUserId?: number | null;
  reportedListingId?: number | null;
}

export interface ReviewReportRequest {
  status: Exclude<ReportStatus, 'aperta'>;
  resolutionNote?: string | null;
}
