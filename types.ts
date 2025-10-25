export interface Message {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface Background {
  type: 'color' | 'default' | 'glass';
  value: string;
}

export interface Conversation {
  id:string;
  title: string;
  messages: Message[];
}
