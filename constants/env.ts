export enum ENVS {
  local = 'local',
  normal = 'normal',
  hebao = 'hebao',
  furniture = 'furniture',
  restaurant = 'resturant',
}

export const domains = {
  [ENVS.local]: 'localhost',
  [ENVS.normal]: 'chat.goodae.top',
  [ENVS.hebao]: 'hebao.goodae.top',
  [ENVS.furniture]: 'furn.goodae.top',
  [ENVS.restaurant]: 'rest.goodae.top',
};

interface IMetaData {
  title: string;
  description: string;
  mask: any;
  defautMessage?: string;
  env: ENVS;
  qrcode?: string;
  wechat?: string;
  role: any;
}

interface IMeta {
  [key: string]: IMetaData;
}

const defaultChatRole = { name: '助理', avatar: '/images/bot.svg' };

export const metaConfig: IMeta = {
  [ENVS.local]: {
    env: ENVS.local,
    title: 'Chatbot UI',
    description: 'Build your own AI assistant.',
    wechat: 'LzerO12345678',
    qrcode: '/images/qrcode1.jpg',
    role: defaultChatRole,
    mask: [
      'translator',
      'travelor',
      'imageRecognizer',
      'xiaohongshu',
      'gov',
      'petBehaviorist',
      'learnfaster',
      'restVideoScript',
      'restxiaohongshu',
      'weeklyReport',
      'dianping',
      'promptOpt',
      'pinpaigushi',
      'elonmusk',
      'cat',
      'Raiden',
    ],
  },
  [ENVS.normal]: {
    env: ENVS.normal,
    title: 'Chatbot UI',
    description: 'Build your own AI assistant.',
    wechat: 'LzerO12345678',
    qrcode: '/images/qrcode1.jpg',
    role: defaultChatRole,
    mask: [
      'translator',
      'travelor',
      'imageRecognizer',
      'xiaohongshu',
      'gov',
      'petBehaviorist',
      'learnfaster',
      'dianping',
      // 'weeklyReport',
      'promptOpt',
      'elonmusk',
      'cat',
      'Raiden'
    ],
  },
  [ENVS.hebao]: {
    env: ENVS.hebao,
    title: '禾宝传媒',
    role: defaultChatRole,
    description: 'Build your own AI assistant',
    mask: ['hebaoxiaohongshu', 'hebaoVideoScript'],
  },
  [ENVS.furniture]: {
    env: ENVS.normal,
    title: '新媒体运营助手',
    role: defaultChatRole,
    description: 'Build your own AI assistant.',
    wechat: 'LzerO12345678',
    qrcode: '/images/qrcode1.jpg',
    mask: [
      'furnVideoScript',
      'furnxiaohongshu',
      'dianping'
    ],
  },
  [ENVS.restaurant]: {
    env: ENVS.normal,
    title: '新媒体运营助手',
    role: defaultChatRole,
    description: 'Build your own AI assistant.',
    wechat: 'LzerO12345678',
    qrcode: '/images/qrcode1.jpg',
    mask: [
      'restVideoScript',
      'restxiaohongshu',
      'dianping'
    ],
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
