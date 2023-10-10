import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import { isMobile } from '@/utils/app';

interface Props {
  onClick: any;
  side: 'left' | 'right';
}

export const CloseSidebarButton = ({ onClick, side }: Props) => {
  const mainClasses = isMobile() ? `top-2.5 h-7 w-7 ${side === 'right' ? 'right-[270px]' : 'left-[270px]'} text-white` : `top-[2px] ${side === 'right' ? 'right-[270px]' : 'left-[360px]'} text-neutral-700 h-8 w-8`;
  return (
    <>
      <button
        className={`fixed z-50 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 ${mainClasses}`}
        onClick={onClick}
      >
        {side === 'right' ? <IconArrowBarRight /> : <IconArrowBarLeft />}
      </button>
      <div
        onClick={onClick}
        className="absolute top-0 left-0 z-10 h-full w-full bg-black opacity-70 lg:hidden"
      ></div>
    </>
  );
};

export const OpenSidebarButton = ({ onClick, side }: Props) => {
  const mainClasses = isMobile() ? `top-2.5 ${side === 'right' ? 'right-2' : 'left-2'} h-7 w-7 text-white` : `top-[2px] ${side === 'right' ? 'right-2' : 'left-[92px]'} h-8 w-8 text-neutral-700`;
  return (
    <button
      className={`fixed z-50 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 ${mainClasses}`}
      onClick={onClick}
    >
      {side === 'right' ? <IconArrowBarLeft /> : <IconArrowBarRight />}
    </button>
  );
};
