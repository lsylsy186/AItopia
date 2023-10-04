import React, {
  FC,
} from "react";
import { Status } from '@/components/Chat/Status';
import { useModel } from '@/hooks';
import { getMeta, ENVS } from '@/constants';
import { useRouter } from 'next/router';
import SigninButton from '@/components/Buttons/SinginButton';

// 聊天区域顶栏
export const ChatTopBar: FC<any> = (props: any) => {
  const { user, isUploading } = useModel('global');
  const balance = user?.account?.balance || 0;
  const meta = getMeta(window.location.href || '');
  const { env } = meta;

  const router = useRouter();

  const BalanceComp = () => {
    return <>
      <span>剩余算力：<span className={`text-sm ${balance <= 0 ? 'text-red-600' : ''}`}>{balance}</span></span>
    </>
  }

  // 支持联系方式
  const ableContact = env === ENVS.normal || ENVS.local;

  return (
    <div className="sticky top-0 z-10 px-2 md:px-5 flex justify-between items-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200">
      {/* {t('Model')}: {selectedConversation?.model.name} | {t('Temp')}
    : {selectedConversation?.temperature} |
    <button
      className="ml-2 cursor-pointer hover:opacity-50"
      onClick={handleSettings}
    >
      <IconSettings size={18} />
    </button>
    <button
      className="ml-2 cursor-pointer hover:opacity-50"
      onClick={onClearAll}
    >
      <IconClearAll size={18} />
    </button> */}
      <button
        className="cursor-pointer select-none gap-3 rounded-md text-[14px] leading-3 transition-colors duration-200 hover:bg-gray-500/10 md:px-10"
        onClick={() => {
          if (!ableContact) return;
          router.push('/other/contact')
        }}
      >
        <span>{BalanceComp()}</span>
      </button>
      <Status show={isUploading} />
      <SigninButton />
    </div>
  );
};