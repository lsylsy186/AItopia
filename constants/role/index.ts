import { IApiType, IRole, formType, language } from './type';
import { weeklyReport, translator, travelor, learnfaster, petBehaviorist, imageRecognizer, xiaohongshu, gov, promptOpt, dianping, zhishiruanwen, youahaiwaigou } from './common';
import { elonmusk, cat, Raiden } from './bot';
import { hebaoxiaohongshu, hebaoVideoScript, hebaozixun, hebaozhaiyao } from './hebao';
import { furnVideoScript, furnxiaohongshu } from './furniture';
import { restVideoScript, restxiaohongshu, pinpaigushi, pinpaigushi2 } from './restuarant';
export {
  formType,
  language,
  IApiType
};

export type { IRole, IOption, IRoleOption } from './type';

export const defaultRoleList: IRole[] = [
  translator,
  travelor,
  imageRecognizer,
  xiaohongshu,
  hebaoxiaohongshu,
  hebaoVideoScript,
  gov,
  petBehaviorist,
  learnfaster,
  hebaozixun,
  hebaozhaiyao,
  furnVideoScript,
  furnxiaohongshu,
  restVideoScript,
  restxiaohongshu,
  weeklyReport,
  promptOpt,
  elonmusk,
  cat,
  Raiden,
  dianping,
  pinpaigushi,
  pinpaigushi2,
  zhishiruanwen,
  youahaiwaigou
].map((elem, index) => {
  elem.index = index;
  return elem;
});


// TODO: Create your own course with just one click, With this PROMPT you can create your complete course with all the details in just one click
// "Develop a 前端开发 course for me, from basic to advanced. I need you to be my master, act as a PhD professor in 计算机科学 , be professional, and if possible, provide long and detailed answers without losing quality."
// Write in Chinese
// With a Warm tone
// In a Instructive style