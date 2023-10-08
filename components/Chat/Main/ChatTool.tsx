import message from 'antd/lib/message';
import { useSession } from "next-auth/react";
import { getMeta, ENVS } from '@/constants';
import HomeContext from '@/pages/api/home/home.context';
import {
  memo,
  useCallback,
  useContext,
} from 'react';
import dynamic from 'next/dynamic'
import { useModel } from '@/hooks';
import Spinner from '../../Spinner';

// import { SystemPrompt } from './SystemPrompt';
// import { TemperatureSlider } from './Temperature';

const messageComp = message;

const RoleModal = dynamic(() => import('../RoleModal'), {
  loading: () => <div><Spinner size="16px" className="mx-auto" /></div>,
});
const RoleList = dynamic(() => import('../RoleList'), {
  loading: () => <div><Spinner size="16px" className="mx-auto" /></div>,
});

interface Props {
  handleSend: any;
  models: any;
  chatContainerRef: any;
  handleScroll: any;
}

export const ChatTool = memo(({ handleSend, models, chatContainerRef, handleScroll }: Props) => {
  const {
    handleNewConversation,
  } = useContext(HomeContext);
  const { status } = useSession();
  const { setActiveMenu } = useModel('global');
  const meta = getMeta(window.location.href || '');
  const { title, env } = meta;

  // 显示快捷工具标题
  const showShortcutTool = env === ENVS.normal;

  const onRoleSelect = useCallback((prompt: string) => {
    if (status !== 'authenticated') {
      messageComp.warning('请登录后再发送信息');
      return;
    }
    handleNewConversation();
    handleSend({ role: 'user', content: prompt, hide: true }, 0, null);
    setActiveMenu('chat');
  }, [status, handleSend]);


  return (
    <div
      className="max-h-full overflow-x-hidden"
      ref={chatContainerRef}
      onScroll={handleScroll}
    >
      <div className="relative flex overflow-hidden bg-white dark:bg-[#343541]">
        <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[800px]">
          <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
            {models.length === 0 ? (
              <div>
                <Spinner size="16px" className="mx-auto" />
              </div>
            ) : (
              title
            )}
            {
              models.length > 0 && <>
                {
                  showShortcutTool
                    ? <div className='text-lg font-semibold text-stone-700'>快捷工具: </div>
                    : <></>
                }
                <RoleModal onSelect={onRoleSelect} />
                <RoleList onSelect={onRoleSelect} />
              </>
            }
          </div>
        </div>
      </div>
    </div>
  );
});
