import { IconFileExport, IconSettings } from '@tabler/icons-react';
import { getMeta, ENVS } from '@/constants';
import { useContext, useState } from 'react';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { useTranslation } from 'next-i18next';

import HomeContext from '@/pages/api/home/home.context';

import { Import } from '../../Settings/Import';
import { Key } from '../../Settings/Key';
import ChatbarContext from '../Chatbar.context';
import { ClearConversations } from './ClearConversations';
import { PluginKeys } from './PluginKeys';
import { useModel } from '@/hooks';
import { IconAlien } from '@tabler/icons-react';
import { useRouter } from 'next/router';

export const ChatbarSettings = () => {
  const { t } = useTranslation('sidebar');
  const { user } = useModel('global');
  const router = useRouter();
  const balance = user.account?.balance;

  const {
    handleClearConversations,
    handleImportConversations,
    handleExportData,
    handleApiKeyChange,
  } = useContext(ChatbarContext);
  const { conversations } = useModel('chat');
  const BalanceComp = () => {
    return <>
      <span>剩余算力：<span className={`font-bold ${balance <= 0 ? 'text-red-600' : ''}`}>{balance}</span></span>
    </>
  }

  const meta = getMeta(window.location.href || '');
  const { env } = meta;

  // 支持联系方式
  const ableContact = env === ENVS.normal || ENVS.local;

  return (
    <div className="flex flex-col items-center space-y-1 border-t border-white/20 pt-1 text-sm">
      <SidebarButton
        text={BalanceComp()}
        icon={<IconAlien size={18} />}
        onClick={() => {
          if (!ableContact) return;
          router.push('/other/contact')
        }
        }
      />
      {conversations.length > 0 ? (
        <ClearConversations onClearConversations={handleClearConversations} />
      ) : null}

      {/* <Import onImport={handleImportConversations} />

      <SidebarButton
        text={t('Export data')}
        icon={<IconFileExport size={18} />}
        onClick={() => handleExportData()}
      /> */}
    </div>
  );
};
