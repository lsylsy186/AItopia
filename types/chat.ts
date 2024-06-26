import { OpenAIModel } from './openai';

export interface Message {
  role: Role;
  content: string;
  hide?: boolean;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  model: OpenAIModel;
  messages: Message[];
  key: string;
  prompt: string;
  temperature: number;
  userId?: string;
  balance: number;
  options?: {};
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  model: OpenAIModel;
  prompt: string;
  temperature: number;
  folderId: string | null;
  // 来源：新建，空间
  source?: 'new' | 'workspace';
  assistant?: {
    avatar: string;
    name: string;
  }
}
