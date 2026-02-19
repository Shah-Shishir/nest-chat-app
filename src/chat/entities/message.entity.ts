export enum MessageType {
  TEXT = 'TEXT',
  VOICE = 'VOICE',
  MEDIA = 'MEDIA',
}

export class Message {
  id: string;
  sender: {
    id: string;
    username: string;
  };
  type: 'TEXT' | 'VOICE' | 'MEDIA';
  content: string;
  sentAt: string;
}
