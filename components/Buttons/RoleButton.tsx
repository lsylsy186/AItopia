import { IRole } from '@/constants';
import { useModel } from '@/hooks';
import Image from 'next/image';
import Card from 'antd/lib/card';
import { FC, useCallback, useMemo } from 'react';
import { IconLockOpen } from '@tabler/icons-react';
import { isMobile } from '@/utils/app';

// const Card = dynamic(() => import('antd/lib/card'));

interface Props {
  role: IRole;
  onSelect: (params: string) => void;
}

const { Meta } = Card as any;

const RoleButton: FC<Props> = ({
  role,
  onSelect
}) => {
  const { user, setRoleModalOpen, setCurrentRole } = useModel('global');
  const balance = user?.account?.balance || 0;

  const onClick = useCallback(() => {
    if (role.options) {
      setRoleModalOpen(true);
      setCurrentRole(role);
    } else {
      onSelect(role.prompt);
    }
  }, [role, setRoleModalOpen, setCurrentRole, onSelect]);

  const times = useMemo(() => {
    return Math.round(balance / role.cost);
  }, [role, balance]);

  const descriptionComp = useMemo(() => {
    return (
      <div className={`${isMobile() ? 'text-xs' : 'text-sm'} 'text-neutral-500'`}>
        <span>{role.description}</span>
        <div className="flex justify-end mt-[3px]">
          <span className='text-xs'>{role.mode === 'bot' ? <IconLockOpen size={14} /> : <span className='border rounded text-gray-500'>{times}</span>}</span>
        </div>
      </div>
    )
  }, [role, times]);

  const bodeStyleHeight = useMemo(() => {
    let result = role.mode === 'bot' ? 120 : 100;
    if (isMobile()) {
      result = role.mode === 'bot' ? 110 : 90;
    }
    return result;
  }, [role?.mode]);

  return (
    <div className='md:w-[120px] w-[110px]'>
      <Card
        className='m-1'
        onClick={onClick}
        hoverable
        bodyStyle={{ padding: '8px 4px 4px 4px', fontSize: 12, height: bodeStyleHeight }}
        cover={<Image priority src={role.img} alt={role.imgAlt} width={115} height={115} />}
      >
        <Meta style={{ fontSize: 12 }} title={role.title} description={descriptionComp} />
      </Card>
    </div>
  );
};

export default RoleButton;
