import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
import { Message, MessageType } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JoinedUserDto } from './dto/joined-user.dto';

// Constants
import { ServerEvents } from 'src/constants/chat.constant';

@Injectable()
export class ChatService {
  onlineUsers: JoinedUserDto[] = [];
  messeges: Message[] = [];

  joinChat(username: string, socket: Socket) {
    // Create the joinedUser instance with necessary data
    const joinedUser: JoinedUserDto = {
      id: socket.id,
      username,
      joinedAt: new Date().toISOString(),
    };

    // Add that user to the onlineUsers list
    this.onlineUsers.push(joinedUser);

    // Broadcast to other clients that a new user joined
    socket.broadcast.emit(ServerEvents.USER_JOINED, {
      joinedUser,
      message: `${joinedUser.username} joined!`,
      onlineUsers: this.onlineUsers,
    });
  }

  leaveChat(username: string, socket: Socket) {
    // Delete the entry
    this.onlineUsers = this.onlineUsers.filter((user) => user.id !== socket.id);

    // Broadcast to other clients that an user left
    socket.broadcast.emit(ServerEvents.USER_LEFT, {
      message: `${username} left!`,
      onlineUsers: this.onlineUsers,
    });
  }

  isTyping(username: string, socket: Socket) {
    // Broadcast to other clients that an user is typing
    socket.broadcast.emit(ServerEvents.IS_TYPING, {
      message: `${username} is typing!`,
    });
  }

  sendMessage(createMessageDto: CreateMessageDto, socket: Socket) {
    // Create the message instance with necessary data
    const newMessage: Message = {
      id: uuidv4(),
      sender: {
        id: socket.id,
        username: createMessageDto.sender,
      },
      type: MessageType.TEXT,
      content: createMessageDto.content,
      sentAt: new Date().toISOString(),
    };

    // Add newMessage to DB
    this.messeges.push(newMessage);

    // Broadcast to other clients that a new message has been sent
    socket.broadcast.emit(ServerEvents.MESSAGE_SENT, {
      newMessage,
    });
  }

  findAllMessages() {
    // Fetch all messages
    return this.messeges;
  }

  updateMessage(updateMessageDto: UpdateMessageDto, socket: Socket) {
    // Update the requested message
    this.messeges = this.messeges.map((message) => {
      if (message.id === updateMessageDto.id) {
        if (updateMessageDto.type) {
          message.type = updateMessageDto.type;
        }
        if (updateMessageDto.content) {
          message.content = updateMessageDto.content;
        }
      }

      return message;
    });

    // Broadcast to other clients that a message has been updated
    socket.broadcast.emit(ServerEvents.MESSAGE_UPDATED, {
      messeges: this.messeges,
    });
  }

  removeMessage(messageId: string, socket: Socket) {
    // Delete the requested message
    this.messeges = this.messeges.filter((message) => message.id !== messageId);

    // Broadcast to other clients that a message has been deleted
    socket.broadcast.emit(ServerEvents.MESSAGE_REMOVED, {
      messeges: this.messeges,
    });
  }
}
