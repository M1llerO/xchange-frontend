export interface MessageDto {
  id: number;
  offerId: number;
  senderId: number;
  senderUsername: string;
  body: string;
  sentAt: string;
  readAt: string | null;
}

export interface SendMessageRequest {
  body: string;
}
