import { Message } from '@/types/chat';
import { ErrorMessage } from '@/types/error';
import { FolderInterface } from '@/types/folder';
import { OpenAIModel } from '@/types/openai';
import { Prompt } from '@/types/prompt';

export interface HomeInitialState {
  apiKey: string;
  loading: boolean;
  lightMode: 'light' | 'dark';
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  models: OpenAIModel[];
  currentMessage: Message | undefined;
  prompts: Prompt[];
  temperature: number;
  showPromptbar: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
}

export const initialState: HomeInitialState = {
  apiKey: '',
  loading: false,
  lightMode: 'dark',
  messageIsStreaming: false,
  modelError: null,
  models: [],
  currentMessage: undefined,
  prompts: [],
  temperature: 1,
  showPromptbar: true,
  currentFolder: undefined,
  messageError: false,
  serverSideApiKeyIsSet: false,
  serverSidePluginKeysSet: false,
};

export interface IHandleNewConversationPayload {
  isbot?: boolean;
  prompt?: string;
  source?: 'new' | 'workspace';
  text?: string;
  temperature?: number;
  assistant?: {
    avatar: string;
    name: string;
  }
}