// types/message.ts

export enum Role {
    User = 'user',
    Bot = 'bot',
  }
  
  export type Message = {
    role: Role;
    content: string;
    image?: string;
  };