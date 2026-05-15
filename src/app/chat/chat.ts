import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
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
  conversationId?: string;
  senderId: any;
  receiverId?: string;
  message: string;
  createdAt?: Date | string;
}

interface MessagesResponse {
  messages?: ChatMessage[];
}

interface ChatUser {
  id: string;
  name?: string;
  username?: string;
  role: string;
  department?: any;
  status: 'online' | 'offline';
  lastMessage?: string;
  unread?: number;
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

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  message = signal('');
  messages = signal<ChatMessage[]>([]);
  userId = signal(localStorage.getItem('id') || '');
  conversationId = signal('');
  allUsers = signal<any[]>([]);
  usersList = signal<any[]>([]);
  selectedUser = signal<ChatUser | null>(null);
  receiverId = signal('');

  constructor(
    private socketService: SocketService,
    private chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.getUser();

    // SOCKET CONNECT
    this.socketService.connect(this.userId());

    // RECEIVE MESSAGE
    this.socketService.receiveMessage(
      (data: any) => {
        console.log('Received Message:', data);

        // IGNORE OWN MESSAGE
        if (this.isMyMessage(data)) {
          return;
        }

        this.messages.update((messages) => [
          ...messages,
          this.normalizeMessage(data)
        ]);

        this.scrollMessagesToBottom();

        console.log("message array", this.messages());

      }
    );
  }

  getUser() {
    this.chatService.getAdminUserList().subscribe((res) => {
      if (res.success) {
        this.allUsers.set(res.data);
        this.usersList.set(res.data.filter((user: any) => user.id !== this.userId()));
        const firstUser = this.usersList()[0];

        if (firstUser) {
          this.selectedUser.set(firstUser);
          this.receiverId.set(firstUser.id);
          this.createConversation();
        }
      } else {
        this.allUsers.set([]);
        this.usersList.set([]);
      }
    })
  }

  selectUser(user: ChatUser) {
    if (user.id === this.receiverId()) {
      return;
    }

    this.selectedUser.set(user);
    this.receiverId.set(user.id);
    this.conversationId.set('');
    this.messages.set([]);
    this.message.set('');
    this.createConversation();
  }

  getInitials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  normalizeMessage(data: any): ChatMessage {
    const socketMessage = data?.message && typeof data.message === 'object'
      ? data.message
      : data;

    if (typeof data === 'string') {
      return {
        senderId: this.receiverId(),
        message: data
      };
    }

    if (typeof socketMessage?.message === 'string') {
      return {
        ...socketMessage,
        senderId: this.getEntityId(socketMessage.senderId) || this.getEntityId(data?.senderId) || this.receiverId(),
        receiverId: this.getEntityId(socketMessage.receiverId) || this.getEntityId(data?.receiverId)
      };
    }

    return {
      ...socketMessage,
      senderId: this.getEntityId(socketMessage?.senderId) || this.receiverId(),
      message: socketMessage?.message?.message || socketMessage?.text || ''
    };
  }

  getMessageText(message: ChatMessage) {
    return message?.message || '';
  }

  isMyMessage(message: any) {
    const normalizedMessage = this.normalizeMessage(message);
    return this.getEntityId(normalizedMessage.senderId) === this.userId();
  }

  getDisplayName(user: any) {
    return user?.username || user?.name || 'User';
  }

  getDepartmentName(user: any) {
    return user?.department?.name || user?.department || 'Department';
  }

  private getEntityId(value: any): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    return value.id || value._id || value.userId || '';
  }

  // CREATE CONVERSATION
  createConversation() {
    if (!this.receiverId()) {
      return;
    }

    const payload = {
      senderId: this.userId(),
      receiverId: this.receiverId()
    };

    this.chatService.createConversation<any>(payload).subscribe({
      next: (res: any) => {
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
        this.messages.set((res.messages || []).map((message) => this.normalizeMessage(message)));
        this.scrollMessagesToBottom();
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
      receiverId: this.receiverId(),
      message,
      createdAt: new Date()
    };

    // INSTANT UI UPDATE
    this.messages.update((messages) => [
      ...messages,
      data
    ]);
    this.scrollMessagesToBottom();

    // SOCKET SEND
    this.socketService.sendMessage(data);

    // CLEAR INPUT
    this.message.set('');
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  private scrollMessagesToBottom() {
    setTimeout(() => {
      const container = this.messagesContainer?.nativeElement;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }
}
