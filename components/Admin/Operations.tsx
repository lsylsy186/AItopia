import React, { useEffect } from 'react';
import message from 'antd/lib/message';
import Table from 'antd/lib/table';
import { useModel } from '@/hooks';
import { useSession } from "next-auth/react";
import { accessToken } from '@/constants';
import { useRouter } from 'next/router';
import { OperationType, OperationTypeMap } from './config';

export const Operations = () => {
  const { operations, callFetchOperations } = useModel('admin');

  const { data: session } = useSession();
  const signedIn: any = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';

  const columns = [
    {
      title: '操作 ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '操作类型',
      dataIndex: 'opType',
      key: 'opType',
      render: (v: OperationType) => <a>{OperationTypeMap[v]}</a>,
    },
    {
      title: '操作',
      dataIndex: 'op',
      key: 'op',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作用户',
      dataIndex: 'user',
      key: 'user',
    }
  ];

  // 只有Super权限账户可以修改算力
  const mergedColumns = columns.filter(column => !(signedIn?.role !== 'Super' && column.dataIndex === 'operation'));

  const router = useRouter();

  useEffect(() => {
    if (signedIn?.accessToken?.token) {
      const { role } = signedIn;
      const available = role === 'Super';
      if (!available) {
        message.error('无访问权限');
        router.push('/');
      }
      callFetchOperations();
    }

  }, [signedIn, router]);
  return (
    <Table
      dataSource={operations}
      columns={mergedColumns}
      bordered
    />
  )
}