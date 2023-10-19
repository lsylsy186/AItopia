import { ENVS } from '@/constants';

export enum AdminMenuType {
  Accounts = 'Accounts',
  Operations = 'Operations',
  Workspace = 'Workspace',
}

export enum UserRoleType {
  Super = 'Super',
  Admin = 'Admin',
  User = 'User',
}

export enum OperationType {
  add = 'add',
  upgrade = 'upgrade',
  delete = 'delete',
}

export const OperationTypeMap = {
  [OperationType.add]: '新增',
  [OperationType.upgrade]: '更新',
  [OperationType.delete]: '删除',
}

export const userRoleList = [
  {
    value: UserRoleType.Super,
    label: '超级账户',
  },
  {
    value: UserRoleType.Admin,
    label: '管理员',
  },
  {
    value: UserRoleType.User,
    label: '用户',
  },
]

export const menuList = [
  {
    label: '账户管理',
    key: AdminMenuType.Accounts,
  },
  {
    label: '历史操作',
    key: AdminMenuType.Operations,
  },
  {
    label: '空间管理',
    key: AdminMenuType.Workspace,
  },
];


export enum ModeType {
  chat = 'chat',
  bot = 'bot',
}

export enum RoleOptionType {
  select = 'select',
  input = 'input',
}

export const modeList = [
  {
    value: ModeType.chat,
    label: '对话',
  },
  {
    value: ModeType.bot,
    label: '聊天',
  },
];

export const roleOptions = [
  {
    value: RoleOptionType.input,
    label: '输入框'
  },
  {
    value: RoleOptionType.select,
    label: '选择器'
  }
];

export const widthOptions = [
  {
    value: 150,
    label: '短'
  },
  {
    value: 200,
    label: '中'
  },
  {
    value: 250,
    label: '长'
  },
];

export const productLineOptions = [
  {
    value: ENVS.normal,
    label: 'chat'
  },
  {
    value: ENVS.hebao,
    label: 'hebao'
  },
  {
    value: ENVS.furniture,
    label: 'furn'
  },

  {
    value: ENVS.restaurant,
    label: 'rest'
  },
];

export enum IApiType {
  openai = "openai",
  fastgpt = "fastgpt",
  vectorvein = "vectorvein",
  flowise = "flowise"
}