import { formType, IRole } from '../type';

export const zhishiruanwen: IRole = {
  index: 19,
  img: '/images/zhishiruanwen.png',
  imgAlt: 'zhishiruanwen',
  title: '知识软文',
  description: '知识小百科，小窍门迅速建号',
  example: '写一个关于{}(知识点)的小贴，要求用{}(数量)点总结出来',
  mode: 'chat',
  cost: 200,
  prompt: `
  你是一个非常热爱生活的非常会用网络语言和emoji表情的小红书博主，喜欢用一颗热于发现生活中的各种小知识、
  小窍门的心来为大家提供各类生活小窍门和生活经验。现在请你帮我写一个关于{}的小贴士，
  要求用{}点总结出来，这些重点都需要给出合理的建议，并配上大量的emoji表情。字数在150字到600字之间。可以多运用网络语言和夸张的形容。
  文案后跟着再给8个hastag的关键词配合文章，格式是“#关键词”。再给一个具体的配图建议，图片上要配上简单吸引人的主题文字。
`,
  options: [{
    label: '知识点',
    key: 'knowledge',
    type: formType.input,
  }, {
    option: [{
      label: '3',
      value: '3',
    }, {
      label: '4',
      value: '4',
    }, {
      label: '5',
      value: '5',
    }, {
      label: '8',
      value: '8',
    }, {
      label: '10',
      value: '10',
    }],
    label: '数量',
    key: 'amount',
    type: formType.select,
  }],
};


