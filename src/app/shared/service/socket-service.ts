import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket!: Socket;

  connect(userId: string) {
    this.socket = io('http://localhost:3000');
    this.socket.emit('setup', userId);
  }

  joinChat(conversationId: string) {
    this.socket.emit('join_chat', conversationId);
  }

  sendMessage(data: any) {
    this.socket.emit('send_message', data);
  }

  receiveMessage(callback: any) {
    this.socket.off('receive_message');
    this.socket.on('receive_message', (data) => {
      callback(data);
    });
  }

  typing(conversationId: string) {
    this.socket.emit('typing', conversationId);
  }

  stopTyping(conversationId: string) {
    this.socket.emit('stop_typing', conversationId);
  }

  onlineUsers(callback: any) {
    this.socket.on('online_users', (users) => {
      callback(users);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

}
