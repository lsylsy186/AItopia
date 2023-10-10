import { FC, useMemo } from 'react';
import RoleButton from '@/components/Buttons/RoleButton';
import { IRole, defaultRoleList, getMeta } from '@/constants';

interface Props {
  onSelect: (params: string) => void;
  list?: IRole[];
}

const roleFormatter = (roleList: IRole[], mode?: 'chat' | 'bot') => {
  return roleList.filter((role: IRole) => role.mode === mode).reduce((pre: any, cur: IRole, index) => {
    let result = pre;
    if (index % 6 === 0) {
      result.push([cur]);
    } else {
      result[result.length - 1].push(cur);
    }
    return result;
  }, []);
}

const RoleList: FC<Props> = ({
  onSelect,
  list = defaultRoleList
}) => {
  const { mask } = getMeta(window.location.href || '');
  const roleList = mask ? list.filter(elem => mask.includes(elem.imgAlt)) : list;
  const chatRoleList = useMemo(() => (roleFormatter(roleList, 'chat')), [roleList]);
  const botRoleList = useMemo(() => (roleFormatter(roleList, 'bot')), [roleList]);

  return (
    <div className='flex flex-wrap flex-col pb-40 md:w-[800px] w-screen mt-[25px]'>
      <div className='mb-[20px] relative'>
        <div className='relative flex items-center mb-[20px] text-xl px-1'>我的助手</div>
        {chatRoleList.map((roleList: IRole[]) => (
          <div className='md:w-[800px] w-[400px] overflow-x-scroll grid'>
            <div className='w-full flex relative'>
              {
                roleList.map((role: IRole) => (
                  <RoleButton role={role} onSelect={onSelect} />
                ))
              }
            </div>
          </div>
        ))}
      </div>
      <div className='mb-[20px] relative'>
        <div className='relative flex items-center mb-[20px] text-xl px-1'>我的搭档</div>
        <div className='w-full flex relative'>
          {botRoleList.map((roleList: IRole[]) => (
            <div className='md:w-[800px] w-[400px] overflow-x-scroll grid'>
              <div className='w-full flex relative'>
                {
                  roleList.map((role: IRole) => (
                    <RoleButton role={role} onSelect={onSelect} />
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div >
  );
};

export default RoleList;