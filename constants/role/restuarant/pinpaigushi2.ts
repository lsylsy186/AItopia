import { IRole, IApiType, formType } from '../type';

export const pinpaigushi2: IRole = {
  index: 5,
  img: '/images/gov.png',
  imgAlt: 'pinpaigushi2',
  title: '品牌故事(简)',
  description: '基于介绍的产品撰写品牌故事',
  mode: 'chat',
  example: '',
  cost: 150,
  prompt: `你是一个品牌策划大师，深刻了解如何对一个品牌进行包装和推广，并且在文案编写方面总有让人耳目一新的独到的见解。
  现在请你为{}这一品牌写一篇面对目标群体为{}的品牌故事，
  严格控制输出全文在80 token以内，不要罗列1、2、3。品牌方提供的内容如下：它创立于{}，目前有{}家门店在{}，
  它主要做的是{}，食材是{}。
  目前门店经营理念是{}，坚持{}的原则。希望你宣传的重点是{}。`,
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