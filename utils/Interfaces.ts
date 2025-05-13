

export enum Role {
  User = 'user',
  Bot = 'bot',
}

export interface Message {
  role: Role;            
  content: string;
  image?: string;
}

export interface RawMessage {
  role: 'user' | 'bot';  
  text: string;
  image?: string;
}

export interface Chat {
  id: number;
  title: string;
}
