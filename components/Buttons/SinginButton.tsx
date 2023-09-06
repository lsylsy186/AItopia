import { signIn, signOut, useSession } from 'next-auth/react';
import message from 'antd/lib/message';
import { useModel } from '@/hooks';
import useAuthService from '@/services/useAuthService';
import React, { useCallback, useEffect } from 'react';

const SigninButton = () => {
  const { data: session } = useSession();
  const { setUser, user } = useModel('global');
  const { fetchUserInfo } = useAuthService();
  const signedIn = session && session.user;

  useEffect(() => {
    const requestUser = async () => {
      const res = await fetchUserInfo({ id: signedIn?.id });
      if (res.success) {
        message.success(res.message);
        setUser(res.data);
      } else {
        message.error(res.message);
      }
    }
    // requestUser();
  }, [signedIn, setUser]);

  const onSignInBtnClick = useCallback(() => {
    if (signedIn) signOut();
    else signIn();
  }, [signedIn]);
  return (
    <div className='flex ml-2'>
      {signedIn ? <p className='text-sky-600'>{session?.user?.name}</p> : <></>}
      <button onClick={() => onSignInBtnClick()} className="ml-2 cursor-pointer hover:opacity-50">
        {signedIn ? '退出登录' : '登陆'}
      </button>
    </div>
  )
};

export default SigninButton;