import React, { useEffect, useState } from 'react';
import message from 'antd/lib/message';
import Table from 'antd/lib/table';
import { useModel } from '@/hooks';
import { useSession } from "next-auth/react";
import { accessToken } from '@/constants';
// import Menu from 'antd/lib/menu';
import { useRouter } from 'next/router';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd/es/menu';

type MenuItem = Required<MenuProps>['items'][number];

const menuList = [
  {
    label: 'Home',
    key: 'Home',
  },
  {
    label: 'Transactions',
    key: 'Transactions',
  },
  {
    label: 'Accounts',
    key: 'Accounts',
  },
  {
    label: 'Tax',
    key: 'Tax',
  }
];

interface DataType {
  key: string;
  name: string;
  email: string;
  balance: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: '账号',
    dataIndex: 'name',
    key: 'name',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '算力',
    dataIndex: 'balance',
    key: 'balance',
  },
  // {
  //   title: '操作',
  //   dataIndex: 'operation',
  //   key: 'Operation',
  //   render: (_, record) => (
  //     <Space size="middle">
  //       <a>Invite {record.name}</a>
  //       <a>Delete</a>
  //     </Space>
  //   ),
  // },
];

export default function Admin() {
  const [menu, setMenu] = useState<string>('home');
  const { users, callFetchUsers } = useModel('admin');
  const { data: session } = useSession();
  const signedIn: any = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';

  const router = useRouter();

  useEffect(() => {
    if (signedIn?.accessToken?.token) {
      const { role, productLine } = signedIn;
      const available = role === 'Super' || role === 'Admin';
      if (!available) {
        message.error('无访问权限');
        router.push('/');
      }
      callFetchUsers(signedIn.productLine);
    }

  }, [signedIn, router]);

  const back = () => {
    router.push('/');
  }
  return (
    <div className="flex h-screen w-full bg-white">
      <main className="flex-grow p-6 bg-white">
        <div className="flex justify-between items-center mb-4">
          <a className="cursor-pointer" onClick={back}>返回</a>
          {/* <Menu
            onClick={onClick}
            style={{ width: 256 }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={menuList}
          /> */}
        </div>
        <Table dataSource={users} columns={columns} />
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