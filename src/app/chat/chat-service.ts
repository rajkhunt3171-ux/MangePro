import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  // CREATE / GET CONVERSATION
  createConversation<T>(data: unknown) {
    return this.http.post<T>(`${this.baseUrl}/chat/conversation`, data);
  }

  // GET MESSAGES
  getMessages<T>(conversationId: string) {
    return this.http.get<T>(`${this.baseUrl}/chat/messages/${conversationId}`);
  }

  // GET USER CONVERSATIONS
  getUserConversations<T>(userId: string) {
    return this.http.get<T>(`${this.baseUrl}/chat/conversation/${userId}`);
  }
}
