import {
  Component,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';

import { SocketService }
  from '../shared/service/socket-service';

import { FormsModule }
  from '@angular/forms';

import { CommonModule }
  from '@angular/common';

import { ChatService }
  from './chat-service';

interface ChatMessage {
  conversationId: string;
  senderId: string;
  message: string;
  createdAt?: Date | string;
}

interface ConversationResponse {
  conversation: {
    _id: string;
  };
}

interface MessagesResponse {
  messages?: ChatMessage[];
}

@Component({
  selector: 'app-chat',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './chat.html',

  styleUrls: ['./chat.scss'],
})

export class Chat implements OnInit, OnDestroy {

  message = signal('');
  messages = signal<ChatMessage[]>([]);
  userId = signal(localStorage.getItem('id') || '');
  receiverId = signal('USR909856');
  conversationId = signal('');

  constructor(
    private socketService: SocketService,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {

    // SOCKET CONNECT
    this.socketService.connect(this.userId());

    // CREATE / GET CONVERSATION
    this.createConversation();

    // RECEIVE MESSAGE
    this.socketService.receiveMessage(
      (data: ChatMessage) => {
        console.log('Received Message:', data);

        // IGNORE OWN MESSAGE
        if (data.senderId === this.userId()) {
          return;
        }

        this.messages.update((messages) => [
          ...messages,
          data
        ]);
      }
    );
  }

  // CREATE CONVERSATION
  createConversation() {
    const payload = {
      senderId: this.userId(),
      receiverId: this.receiverId()
    };

    this.chatService.createConversation<ConversationResponse>(payload).subscribe({
      next: (res: ConversationResponse) => {
        console.log('Conversation:', res);

        // SAVE CONVERSATION ID
        this.conversationId.set(res.conversation._id);

        // JOIN SOCKET ROOM
        this.socketService.joinChat(this.conversationId());

        // LOAD OLD MESSAGES
        this.loadMessages();
      },

      error: (err) => {
        console.log(err);
      }
    });
  }

  // LOAD OLD MESSAGES
  loadMessages() {
    this.chatService.getMessages<MessagesResponse>(this.conversationId()).subscribe({
      next: (res: MessagesResponse) => {
        console.log('Old Messages:', res);
        this.messages.set(res.messages || []);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }


  // SEND MESSAGE
  sendMessage() {
    // EMPTY CHECK
    const message = this.message().trim();

    if (!message) {
      return;
    }

    const data = {
      conversationId: this.conversationId(),
      senderId: this.userId(),
      message,
      createdAt: new Date()
    };

    // INSTANT UI UPDATE
    this.messages.update((messages) => [
      ...messages,
      data
    ]);

    // SOCKET SEND
    this.socketService.sendMessage(data);

    // CLEAR INPUT
    this.message.set('');
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
