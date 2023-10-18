export enum AdminMenuType {
  Accounts = 'Accounts',
  Operations = 'Operations',
  Workspace = 'Workspace',
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

export const menuList = [
  {
    label: '账户管理',
    key: AdminMenuType.Accounts,
  },
  {
    label: '历史操作',
    key: AdminMenuType.Operations,
  },
  // {
  //   label: '空间管理',
  //   key: AdminMenuType.Workspace,
  // },
];