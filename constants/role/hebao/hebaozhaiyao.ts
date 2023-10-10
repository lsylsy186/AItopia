import { formType, IRole, IApiType } from '../type';

export const hebaozhaiyao: IRole = {
  index: 8,
  img: '/images/hebaozhaiyao.png',
  imgAlt: 'hebaozhaiyao',
  title: '禾宝摘要',
  description: '禾宝传媒丰富经验，回答任何自媒体运营问题',
  mode: 'chat',
  example: '',
  prompt: `学习这个URL：{}, 用中文{}，请以列表的形式展现结果，严格遵守用中文回复的规则`,
  cost: 500,
  options: [{
    label: '信息源',
    key: 'url',
    type: formType.input,
  }, {
    label: '指令',
    key: 'content',
    type: formType.input,
  }],
  api: IApiType.flowise
};
