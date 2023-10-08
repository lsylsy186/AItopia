import {
  IconMessages,
  IconHome,
  IconBriefcase,
  IconCategory2,
  IconRobot,
} from '@tabler/icons-react';
import { MenuType } from '@/constants';

export interface IMenu {
  icon: JSX.Element;
  label: string;
  path: string;
  name: string;
  onClick?: any;
  showOnMobile?: boolean
}

export const MenuList: IMenu[] = [
  {
    icon: <IconMessages size={24} />,
    label: "对话",
    path: '',
    name: MenuType.chat,
    showOnMobile: true,
  },
  {
    icon: <IconCategory2 size={24} />,
    label: "空间",
    path: '',
    name: MenuType.workspace,
    showOnMobile: true,
  },
  {
    icon: <IconRobot size={24} />,
    label: "聊天",
    path: '',
    name: MenuType.robot,
    showOnMobile: true,
  },
];

