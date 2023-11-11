import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getMeta } from '@/constants';
import React, { useCallback, useEffect } from 'react';
import message from 'antd/lib/message';

const SigninButton = () => {
  const { data: session } = useSession();
  const signedIn = session && session.user as any;
  let meta: any = {};
  if (typeof window !== 'undefined') {
    meta = getMeta(window.location.href || '');
  }
  const { env } = meta;

  const router = useRouter();

  useEffect(() => {
    if (!!session?.user) {
      const user = session.user as any;
      const available = user?.role === 'Super' || (user?.productLine?.toLowerCase() === env.toLowerCase());
      if (!available) {
        message.error('无当前应用访问权限');
        signOut();
      }
    }
  }, [session?.user]);

  const goResetPwd = () => {
    router.push('/auth/resetPwd');
  }

  const onSignInBtnClick = useCallback(() => {
    if (signedIn) signOut();
    else signIn();
  }, [signedIn]);
  return (
    <div className='flex ml-2'>
      {signedIn ? <>
        <p className='text-sky-600 cursor-pointer' onClick={goResetPwd}>{session?.user?.name}</p>
      </> : <></>}
      <button onClick={() => onSignInBtnClick()} className="ml-2 cursor-pointer hover:opacity-50">
        {signedIn ? '退出登录' : '登陆'}
      </button>
    </div>
  )
};

export default SigninButton;