export enum IApiType {
  openai,
  fastgpt,
  vectorvein,
  flowise
}

export interface IRole {
  img: string;
  imgAlt: string;
  title: string;
  description: string;
  index: number;
  prompt: string;
  options?: IRoleOption[];
  example?: string;
  api?: IApiType;
  mode?: 'chat' | 'bot';
  systemPrompt?: string;
  role?: {
    avatar: string;
    name: string;
  }
}
export interface IOption {
  label: any;
  value: any;
  prompt?: string;
}

export interface IRoleOption {
  option?: IOption[];
  label: string;
  key: string;
  type: formType;
  width?: number;
}

export enum language {
  zh = '中文',
  en = '英文'
}

export enum formType {
  select = 'select',
  input = 'input',
  imageUploader = 'imageUploader',
  promptSelect = 'promptSelect'
}