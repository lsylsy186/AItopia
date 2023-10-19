import React, { useEffect, useState } from 'react';
import message from 'antd/lib/message';
import Table from 'antd/lib/table';
import Form from 'antd/lib/form';
import InputNumber from 'antd/lib/input-number';
import Input from 'antd/lib/input';
import Typography from 'antd/lib/typography';
import { useModel } from '@/hooks';
import { useSession } from "next-auth/react";
import { accessToken } from '@/constants';
import { useRouter } from 'next/router';
import { OperationType, UserRoleType, userRoleList } from './config';

interface DataType {
  key: number;
  name: string;
  email: string;
  balance: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: DataType;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入 ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export const Accounts = () => {
  const { users, callFetchUsers, callAddOperation } = useModel('admin');
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState(-1);
  const { requestUpdateUserAccount } = useModel('global');

  const { data: session } = useSession();
  const signedIn: any = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';

  const isEditing = (record: DataType) => record.key === editingKey;

  const edit = (record: Partial<DataType> & { key: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey(-1);
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as DataType;
      const newData = [...users];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        if (row.balance < 0 || row.balance === item.balance) return;
        const balance = item.balance - row.balance;
        const addTokenCount = balance * 10;
        const result = await requestUpdateUserAccount(item.id, { tokenCount: addTokenCount, isSend: false });
        console.log('result', result);
        if (result) {
          const text = `为用户「${item.name}」变更${-(balance)}算力`;
          message.success(`${text}成功！`);
          callFetchUsers(signedIn.productLine);
          await callAddOperation({
            opType: OperationType.upgrade,
            op: text,
            user: signedIn.name
          });
        }
      }
      // TODO：全量更新的写法
      //  else {
      //   newData.push(row);
      //   // setData(newData);
      // await requestUpdateUserAccount(signedIn?.id, { tokenCount: responseTokenCount, isSend: false });
      //   setEditingKey(-1);
      // }
      setEditingKey(-1);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
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
      title: '产品线',
      dataIndex: 'productLine',
      key: 'productLine',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (value: UserRoleType) => {
        const userItem = userRoleList.find(v => v.value === value);
        return userItem?.label;
      }
    },
    {
      title: '算力',
      dataIndex: 'balance',
      key: 'balance',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: DataType) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              保存
            </Typography.Link>
            <a onClick={cancel}>取消</a>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== -1} onClick={() => edit(record)}>
            编辑
          </Typography.Link>
        );
      },
    },
  ];

  // 只有Super权限账户可以修改算力
  const mergedColumns = columns.map((col: any) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        inputType: col.dataIndex === 'balance' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  }).filter(column => !(signedIn?.role !== 'Super' && column.dataIndex === 'operation'));

  const router = useRouter();

  useEffect(() => {
    if (signedIn?.accessToken?.token) {
      const { role, productLine } = signedIn;
      const available = role === 'Super' || role === 'Admin';
      if (!available) {
        message.error('无访问权限');
        router.push('/');
      }
      callFetchUsers(productLine);
    }

  }, [signedIn, router]);
  return (
    <Form form={form} component={false}>
      <Table
        dataSource={users}
        columns={mergedColumns}
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        pagination={{
          pageSize: 20,
          onChange: cancel,
        }}
      />
    </Form>
  )
}