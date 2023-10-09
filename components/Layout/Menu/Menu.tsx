import React, { useState, useMemo, ReactElement, SyntheticEvent } from 'react';
import { MenuList, IMenu } from './config';
import { MenuType } from '@/constants';
import { isMobile } from '@/utils/app';
import { SettingDialog } from '@/components/Settings/SettingDialog';
import { useModel } from '@/hooks';
import {
  IconSettings
} from '@tabler/icons-react';

interface IMenuItem {
  icon: any;
  label: any;
  active: any;
  onClick: any;
  name: string;
}

interface IWrapper {
  children: ReactElement;
}

export const MenuItem = ({ icon, label, active, onClick, name }: IMenuItem) => {
  const hoverClasses = isMobile() ? "" : "hover:bg-gray-300 hover:text-gray-700";
  const pcActiveClasses = active ? "bg-gray-300 text-gray-900" : "text-black";
  const mobileActiveClasses = active ? "bg-gray-300 text-gray-900" : "text-black";
  const activeClasses = isMobile() ? mobileActiveClasses : pcActiveClasses;
  const clientClasses = isMobile() ? "mx-4 text-xs w-[60px] h-[46px] p-4" : "text-sm w-[60px] h-[60px] mb-[16px] py-4 px-2";

  return (
    <div
      className={`${activeClasses} flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors duration-200 ${clientClasses} ${hoverClasses}`}
      onClick={() => onClick(name)}
    >
      <span className="w-6 h-6">
        {icon}
      </span>
      <span>{label}</span>
    </div>
  );
};


const Wrapper = ({ children }: IWrapper) => {
  if (isMobile()) {
    return <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-10">
      {children}
    </footer>
  }
  return <aside className="sticky flex flex-col items-center top-0 left-0 h-full bg-white w-[80px] border border-gray-100 border-r border-b shadow-[10px_0_10px_rgba(0,0,0,0.10)] border-black/10">
    {children}
  </aside>
}


export const Menu = () => {
  const [isSettingDialogOpen, setIsSettingDialog] = useState<boolean>(false);
  const { activeMenu, setActiveMenu } = useModel('global');
  const { botSelectedConversation, setInitedBotConver } = useModel('bot');

  const onMenuClick = (v: string) => {
    if (activeMenu === MenuType.robot) {
      setInitedBotConver(botSelectedConversation);
    }
    setActiveMenu(v);
  };

  const ManagementList: IMenu[] = useMemo(() => {
    return [
      {
        icon: <IconSettings size={24} />,
        label: "设置",
        path: '',
        name: 'setting',
        onClick: () => setIsSettingDialog(true),
        showOnMobile: true,
      },
    ];
  }, []);

  const MobileContent = useMemo(() => {
    const mobileMenuList = [...MenuList, ...ManagementList].filter((menu) => menu.showOnMobile);

    return (<div className="flex justify-between items-center px-2 py-1">
      {mobileMenuList.map((menu: IMenu) => (
        <MenuItem
          icon={menu.icon}
          label={menu.label}
          name={menu.name}
          active={activeMenu === menu.name}
          onClick={onMenuClick}
        />
      )
      )}
    </div>);
  }, [ManagementList, activeMenu, botSelectedConversation]);

  return (
    <Wrapper>
      <>
        <SettingDialog
          open={isSettingDialogOpen}
          onClose={() => {
            setIsSettingDialog(false);
          }}
        />
        {
          isMobile() ? <>{MobileContent}</> : <> <div className="flex-1 px-2 flex flex-col items-center py-3">
            {MenuList.map((menu: IMenu) => (
              <MenuItem
                icon={menu.icon}
                label={menu.label}
                name={menu.name}
                active={activeMenu === menu.name}
                onClick={onMenuClick}
              />
            )
            )}
          </div>
            <div className="border-t border-black/10 w-full py-3 flex flex-col items-center">
              {/* {!serverSideApiKeyIsSet ? (
          <Key apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        ) : null} */}

              {/* {!serverSidePluginKeysSet ? <PluginKeys /> : null} */}
              {
                ManagementList.map((menu: IMenu) => (
                  <MenuItem
                    icon={menu.icon}
                    label={menu.label}
                    name={menu.name}
                    active={activeMenu === menu.name}
                    onClick={onMenuClick}
                  />
                ))
              }
            </div>
          </>
        }
      </>
    </Wrapper>
  );
};

