import { FC } from 'react';
import RoleButton from '@/components/Buttons/RoleButton';
import { IRole, defaultRoleList, getMeta } from '@/constants';

interface Props {
  onSelect: (params: string) => void;
  list?: IRole[];
}

const RoleList: FC<Props> = ({
  onSelect,
  list = defaultRoleList
}) => {
  const { mask } = getMeta(window.location.href || '');
  const roleList = mask ? list.filter(elem => mask.includes(elem.imgAlt)) : list;

  return (
    <div className='flex flex-wrap md:w-[800px] w-screen pb-40 overflow-y-scroll' style={{ marginTop: 10 }}>
      {roleList.map((role: IRole) => (
        <div key={role.index} className='mr-7 w-1/4 md:mr-1 md:w-[138px]'>
          <RoleButton role={role} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
};

export default RoleList;