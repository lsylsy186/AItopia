export enum ENVS {
  local = 'local',
  normal = 'normal',
  hebao = 'hebao',
}

export const domains = {
  [ENVS.local]: 'localhost',
  [ENVS.normal]: 'chat.goodae.top',
  [ENVS.hebao]: 'hebao.goodae.top',
};

interface IMetaData {
  title: string;
  description: string;
  mask: any;
  defautMessage?: string;
  env: ENVS;
  qrcode?: string;
  wechat?: string;
}

interface IMeta {
  [key: string]: IMetaData;
}

export const metaConfig: IMeta = {
  [ENVS.local]: {
    env: ENVS.local,
    title: 'Chatbot UI',
    description: 'Build your own AI assistant.',
    wechat: 'LzerO12345678',
    qrcode: '/images/qrcode1.jpg',
    mask: [
      'translator',
      'travelor',
      'imageRecognizer',
      'xiaohongshu',
      'gov',
      'petBehaviorist',
      'learnfaster',
    ],
  },
  [ENVS.normal]: {
    env: ENVS.normal,
    title: 'Chatbot UI',
    description: 'Build your own AI assistant.',
    wechat: 'LzerO12345678',
    qrcode: '/images/qrcode1.jpg',
    mask: [
      'translator',
      'travelor',
      'imageRecognizer',
      'xiaohongshu',
      'gov',
      'petBehaviorist',
      'learnfaster',
    ],
  },
  [ENVS.hebao]: {
    env: ENVS.hebao,
    title: '禾宝传媒',
    description: 'Build your own AI assistant',
    mask: ['hebaoxiaohongshu', 'hebaoVideoScript'],
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
