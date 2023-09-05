export enum ENVS {
  normal = 'normal',
  hebao = 'hebao',
}

export const domains = {
  [ENVS.normal]: 'chat.goodae.top',
  [ENVS.hebao]: 'hebao.goodae.top',
};

interface IMetaData {
  title: string;
  description: string;
  mask: any;
  defautMessage?: string;
}

interface IMeta {
  [key: string]: IMetaData;
}

export const metaConfig: IMeta = {
  [ENVS.normal]: {
    title: 'Chatbot UI',
    description: 'Build your own AI assistant.',
    mask: null,
  },
  [ENVS.hebao]: {
    title: '禾宝传媒',
    description: '用于解压和锻炼你的心理素质，慎用',
    mask: ['xiaohongshu2', 'videoScript'],
  }
};

export const getEnv = (url: string = '') => {
  const [k] = Object.entries(domains).find(([_, v]) => {
    return url.includes(v)
  }) || [];
  return k ?? ENVS.normal;
};

export const getMeta = (url: string = ''): IMetaData => {
  const env = getEnv(url);
  return metaConfig[env];
};
