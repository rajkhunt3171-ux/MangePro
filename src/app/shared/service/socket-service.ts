import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export type OnlineUsersPayload = string[] | {
  userIds?: string[];
  users?: string[];
};

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket?: Socket;
  private currentUserId = '';

  connect(userId: string) {
    if (!userId) {
      return;
    }

    if (this.socket && this.currentUserId === userId) {
      return;
    }

    this.disconnect();

    const token = localStorage.getItem('authToken') || '';
    this.currentUserId = userId;

    this.socket = io(environment.socketUrl, {
      auth: {
        token,
        userId
      },
      reconnection: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      // Backend should identify user from JWT. userId is emitted only as fallback.
      this.socket?.emit('setup', userId);
      this.socket?.emit('user_online', { userId });
      this.getOnlineUsers();
    });
  }

  joinChat(conversationId: string) {
    this.socket?.emit('join_chat', conversationId);
  }

  sendMessage(data: any) {
    this.socket?.emit('send_message', data);
  }

  receiveMessage(callback: any) {
    this.socket?.off('receive_message');
    this.socket?.on('receive_message', (data) => {
      callback(data);
    });
  }

  typing(conversationId: string) {
    this.socket?.emit('typing', conversationId);
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('stop_typing', conversationId);
  }

  getOnlineUsers() {
    this.socket?.emit('get_online_users');
  }

  onlineUsersUpdate(callback: (users: OnlineUsersPayload) => void) {
    this.socket?.off('online_users_update');
    this.socket?.on('online_users_update', (users) => {
      callback(users);
    });
  }

  onlineUsers(callback: (users: OnlineUsersPayload) => void) {
    this.onlineUsersUpdate(callback);
  }

  userOnline(callback: (userId: string) => void) {
    this.socket?.off('user_online');
    this.socket?.on('user_online', (payload) => {
      const userId = typeof payload === 'string' ? payload : payload?.userId;
      callback(userId);
    });
  }

  userOffline(callback: (userId: string) => void) {
    this.socket?.off('user_offline');
    this.socket?.on('user_offline', (payload) => {
      const userId = typeof payload === 'string' ? payload : payload?.userId;
      callback(userId);
    });
  }

  onDisconnect(callback: () => void) {
    this.socket?.off('disconnect');
    this.socket?.on('disconnect', () => {
      callback();
    });
  }

  offPresenceEvents() {
    this.socket?.off('online_users_update');
    this.socket?.off('user_online');
    this.socket?.off('user_offline');
  }

  offChatEvents() {
    this.socket?.off('receive_message');
    this.socket?.off('typing');
    this.socket?.off('stop_typing');
  }

  isConnected() {
    return !!this.socket?.connected;
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit('user_offline', { userId: this.currentUserId });
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = undefined;
      this.currentUserId = '';
    }
  }

}
