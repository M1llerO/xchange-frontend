import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { buildParams } from '../core/http-params.util';
import { MessageDto, SendMessageRequest } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMine(unreadOnly?: boolean) {
    return this.http.get<MessageDto[]>(`${this.baseUrl}/messages/mine`, { params: buildParams({ unreadOnly }) });
  }

  getThread(offerId: number) {
    return this.http.get<MessageDto[]>(`${this.baseUrl}/offers/${offerId}/messages`);
  }

  send(offerId: number, data: SendMessageRequest) {
    return this.http.post<MessageDto>(`${this.baseUrl}/offers/${offerId}/messages`, data);
  }

  delete(messageId: number) {
    return this.http.delete<void>(`${this.baseUrl}/messages/${messageId}`);
  }
}
