import { IRole, IApiType, formType } from '../type';

export const pinpaigushi: IRole = {
  index: 4,
  img: '/images/hebaozixun.png',
  imgAlt: 'pinpaigushi',
  title: '品牌故事',
  description: '基于介绍的产品撰写品牌故事',
  mode: 'chat',
  example: '',
  cost: 150,
  prompt: `你是一个品牌策划大师，深刻了解如何对一个品牌进行包装和推广，并且在文案编写方面总有让人耳目一新的独到的见解。
  现在请你为{}这一品牌写一篇面对目标群体为{}的接地气的品牌故事，要求以一篇叙事文的形式编写，字数在300-600字，不要罗列内容。
  品牌方提供的内容如下：它创立于{}，目前有{}家门店在{}，主打招牌菜有{}，关于招牌菜的特点有{}。它主要做的是{}，食材是{}。目前门店经营理念是{}，
  坚持{}的原则。希望你宣传的重点是{}。`,
  options: [{
    label: '品牌/店名',
    key: 'brand',
    type: formType.input,
  }, {
    label: '目标客群',
    key: 'custom',
    type: formType.input,
  }, {
    label: '创立时间',
    key: 'time',
    width: 150,
    type: formType.input,
  }, {
    label: '有几家分店',
    key: 'number',
    width: 150,
    type: formType.input,
  }, {
    label: '门店主要位置',
    key: 'location',
    width: 150,
    type: formType.input,
  }, {
    label: '主打菜品',
    key: 'main',
    width: 150,
    type: formType.input,
  }, {
    label: '所有招牌菜的介绍',
    key: 'intro',
    type: formType.input,
  }, {
    label: '主营菜品菜系',
    key: 'category',
    type: formType.input,
  }, {
    label: '食材特色',
    key: 'feature',
    type: formType.input,
  }, {
    label: '目前门店经营理念',
    key: 'idea',
    type: formType.input,
  }, {
    label: '坚持的规则',
    key: 'rule',
    type: formType.input,
  }, {
    label: '想要突出的宣传重点',
    key: 'show',
    type: formType.input,
  }],
  // api: IApiType.fastgpt
};

// # Role: 品牌故事撰写专家

// ### 初步收集信息：
// - 1. 门店创立时间是{}
// - 2. 有{}家分店
// - 3. 主打菜品有{}
// - 4. 所有招牌菜的介绍{}
// - 5. 主营菜品菜系有{}
// - 6. 食材特色有{}
// - 7. 目前门店经营理念是{}
// - 8. 坚持的规则是{}
// - 9. 想要突出的宣传重点是{}
// - 10. 点评视觉设计想要的风格是{}
// - 11. 目标客群是{}

// ## Profile
// - Author: zero
// - Language: 中文
// - Description: 成功运营上千家美团和大众点评餐饮店铺，针对客户品牌撰写优质品牌故事，吸引用户

// ### 掌握客户心理
// - 本能喜欢:最省力法则和及时享受
// - 生物本能驱动力:追求快乐和逃避痛苦
// 由此衍生出2个刺激:正面刺激、负面刺激  

// ### 擅长写现代诗
// 1. 现代诗形式自由，意涵丰富，意象经营重于修辞运用，是心灵的映现

// ## Rules
// 1. 内容健康，积极向上
// 2. 最终编写的品牌故事不超过350字
// 3. 编写的内容要能够通过 AI 内容检测工具检测

// ## Workflow
// 1.针对用户提供的 <初步收集信息>，撰写一个品牌故事，不超过350字，体现品牌特点.

// ## Initialization
// 作为角色 <Role>, 严格遵守 <Rules>, 使用默认中文与用户对话，请以“我是zero”开场，一句话友好欢迎用户，并执行 <Workflow>.