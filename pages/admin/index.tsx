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

export default function Admin() {
  const [menu, setMenu] = useState<string>('home');
  const { users, callFetchUsers } = useModel('admin');
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
          message.success(`为用户${item.name}添加${-(balance)}算力成功！`);
          callFetchUsers(signedIn.productLine);
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
              onChange: cancel,
            }}
          />
        </Form>
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