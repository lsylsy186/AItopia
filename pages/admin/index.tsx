import React, { useEffect, useState } from 'react';
import message from 'antd/lib/message';
import { useSession } from "next-auth/react";
import { accessToken } from '@/constants';
import Menu from 'antd/lib/menu';
import { useRouter } from 'next/router';
import type { MenuProps } from 'antd/es/menu';
import { AdminMenuType, menuList } from '@/components/Admin/config';
import { Accounts } from '@/components/Admin/Accounts';
import { Operations } from '@/components/Admin/Operations';


interface DataType {
  key: number;
  name: string;
  email: string;
  balance: number;
}

export default function Admin() {
  const [activeAdminMenu, setActiveAdminMenu] = useState(AdminMenuType.Accounts);

  const { data: session } = useSession();
  const signedIn: any = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';

  const router = useRouter();

  useEffect(() => {
    if (signedIn?.accessToken?.token) {
      const { role } = signedIn;
      const available = role === 'Super' || role === 'Admin';
      if (!available) {
        message.error('无访问权限');
        router.push('/');
      }
    }

  }, [signedIn, router]);

  const back = () => {
    router.push('/');
  }

  const onClick = (e: any) => {
    setActiveAdminMenu(e.key);
  }
  return (
    <div className="flex h-screen w-full bg-white">
      <div className="my-2">
        <div className="flex justify-between items-center py-4 px-10">
          <a className="cursor-pointer" onClick={back}>返回</a>
        </div>
        <Menu
          onClick={onClick}
          style={{ width: 158 }}
          selectedKeys={[activeAdminMenu]}
          mode="inline"
          items={menuList}
        />
      </div>
      <main className="flex-grow p-6 bg-white">

        {
          activeAdminMenu === AdminMenuType.Accounts && <Accounts />
        }
        {
          activeAdminMenu === AdminMenuType.Operations && <Operations />
        }
        {
          activeAdminMenu === AdminMenuType.Workspace && <Accounts />
        }
      </main>
    </div>
  )
}

{/* <span className="px-2 py-1 bg-green-200 text-green-800 rounded-md">
<svg
  className=" w-4 h-4 inline-block mr-1"
  fill="none"
  height="24"
  stroke="currentColor"
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="2"
  viewBox="0 0 24 24"
  width="24"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
  <path d="M7 7h.01" />
</svg>
Food
</span>


<span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-md">
<svg
  className=" w-4 h-4 inline-block mr-1"
  fill="none"
  height="24"
  stroke="currentColor"
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="2"
  viewBox="0 0 24 24"
  width="24"
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
  <path d="M7 7h.01" />
</svg>
Home
</span>



<TableCell>
<span className="px-2 py-1 bg-red-200 text-red-800 rounded-md">
  <svg
    className=" w-4 h-4 inline-block mr-1"
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
  Office
</span> */}