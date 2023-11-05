import React, { useEffect, useState } from 'react';
import message from 'antd/lib/message';
import Table from 'antd/lib/table';
import Form from 'antd/lib/form';
import InputNumber from 'antd/lib/input-number';
import Input from 'antd/lib/input';
import Typography from 'antd/lib/typography';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
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
  id: string;
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
  const { users, callFetchUsers, callAddOperation, callRemoveAccount, callModUser } = useModel('admin');
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState(-1);
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string>('');
  const { requestUpdateUserAccount } = useModel('global');

  const { data: session } = useSession();
  const signedIn: any = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';

  const isEditing = (record: DataType) => record.key === editingKey;

  const edit = (record: Partial<DataType> & { key: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.key);
  };

  const deleteItem = (record: Partial<DataType> & { key: React.Key }) => {
    setShowDeleteRoleModal(true);
    setDeleteId(record.id as any);
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

        // 修改用户名
        if (row.name !== item.name) {
          if (item?.role !== 'User') {
            message.warning('无权限修改');
            return;
          }
          const result = await callModUser({ id: item.id, data: { name: row.name, role: item.role } });
          if (result) {
            message.success(`用户名变更为「${row.name}」成功！`);
            callFetchUsers(signedIn.productLine);
            await callAddOperation({
              opType: OperationType.upgrade,
              op: `用户名变更为「${row.name}」`,
              user: signedIn.name
            });
          }
        }
        // 修改算力
        const unableToUpdateBalance = row.balance < 0 || row.balance === item.balance;
        if (!unableToUpdateBalance) {
          const balance = item.balance - row.balance;
          const addTokenCount = balance * 10;
          const result = await requestUpdateUserAccount(item.id, { tokenCount: addTokenCount, isSend: false });
          if (result) {
            let text = `为用户「${item.name}」变更${-(balance)}算力`;
            message.success(`${text}成功！`);
            callFetchUsers(signedIn.productLine);
            await callAddOperation({
              opType: OperationType.upgrade,
              op: text,
              user: signedIn.name
            });
          }
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
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      editable: true,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '账号',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '产品线',
      dataIndex: 'productLine',
      key: 'productLine',
      filters: [
        {
          text: 'Normal',
          value: 'Normal',
        },
        {
          text: 'Hebao',
          value: 'Hebao',
        },
        {
          text: 'Resturant',
          value: 'Resturant',
        },
      ],
      onFilter: (value: string, record: any) => record.productLine.indexOf(value) === 0,
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
      sorter: (a: any, b: any) => a.balance - b.balance,
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
          <>
            <Typography.Link disabled={editingKey !== -1} onClick={() => edit(record)}>
              编辑
            </Typography.Link>
            <Typography.Link className="ml-2" disabled={editingKey !== -1} onClick={() => deleteItem(record)}>
              删除
            </Typography.Link>
          </>
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

  const onCancelDeleteModal = () => {
    setShowDeleteRoleModal(false);
  }

  const onDeleteSubmit = async () => {
    const user = users.find((item: any) => item.id === deleteId);
    if (user.role !== 'User') {
      message.warning('无权限删除');
      return;
    }
    const result = await callRemoveAccount({ id: deleteId, role: user.role });
    if (result) {
      const text = `删除用户：「${user.name}」`;
      message.success(`${text}成功！`);
      callFetchUsers(signedIn.productLine);
      onCancelDeleteModal();
      await callAddOperation({
        opType: OperationType.delete,
        op: text,
        user: signedIn.name
      });
    }
  }

  return (
    <>
      <Modal
        title="删除账户"
        centered
        width={500}
        open={showDeleteRoleModal}
        onCancel={onCancelDeleteModal}
        footer={[
          <Button key="cancel" onClick={onCancelDeleteModal}>
            取消
          </Button>,
          <Button key="submit" className="bg-[#202123] select-none items-center rounded-md border border-white/20 text-white transition-colors duration-200 hover:bg-gray-500/10" type="primary" onClick={onDeleteSubmit}>
            提交
          </Button>,
        ]}
      >
        <p>点击提交按钮删除</p>
      </Modal>
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
    </>
  )
}