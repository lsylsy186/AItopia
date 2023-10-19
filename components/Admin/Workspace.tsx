import React, { useEffect, useState } from 'react';
import message from 'antd/lib/message';
import Table from 'antd/lib/table';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import InputNumber from 'antd/lib/input-number';
import Space from 'antd/lib/space';
import Select from 'antd/lib/select';
import Progress from 'antd/lib/progress';
import Image from 'next/image';
import { useModel } from '@/hooks';
import { useSession } from "next-auth/react";
import { accessToken } from '@/constants';
import { useRouter } from 'next/router';
import { IconCircleMinus, IconCirclePlus } from '@tabler/icons-react';
import { uploadPhotoFromClient } from '@/lib/blob';
import { IApiType, modeList, roleOptions, widthOptions, productLineOptions } from './config';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 },
  },
};

const columns = [
  {
    title: '模块 ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '图片',
    dataIndex: 'img',
    key: 'img',
    render: (value: string, fields: any) => {
      return <Image priority src={value} alt={fields.title} width={75} height={75} />
    }
  },
  {
    title: '名称',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '产品线',
    dataIndex: 'productLine',
    key: 'productLine',
    render: (value: string[]) => {
      return value.map((v: string, index: number) => (<div className='mb-1'>{`${index + 1}.${v}`}</div>))
    }
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '提示词',
    dataIndex: 'prompt',
    key: 'prompt',
    width: 300,
  },
  {
    title: '示例',
    dataIndex: 'example',
    key: 'example',
    width: 200,
  },
  {
    title: '模式',
    dataIndex: 'mode',
    key: 'mode',
  },
  {
    title: '系统提示词',
    dataIndex: 'systemPrompt',
    key: 'systemPrompt',
  },
  // {
  //   title: '助手',
  //   dataIndex: 'assistant',
  //   key: 'assistant',
  // },
  {
    title: '消耗量',
    dataIndex: 'cost',
    key: 'cost',
  },
  // {
  //   title: '选项',
  //   dataIndex: 'roleOptions',
  //   key: 'roleOptions',
  // },
  {
    title: '操作',
    key: 'action',
    width: 107,
    render: (_: any, record: any) => {
      const remove = () => {
        console.log('record', record)
      }
      return (<Space direction="horizontal" size="middle">
        <a>编辑</a>
        <a onClick={remove}>删除</a>
      </Space>)
    }
  },
];

export const Workspace = () => {
  const { callFetchRoleList, roleList, callAddRole } = useModel('role');
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [form] = Form.useForm();
  console.log('roleList', roleList);
  const [uploadError, setUploadError] = useState('');
  const { isUploading, setIsUploading } = useModel('global');

  useEffect(() => {
    if (!!uploadError) {
      message.error(uploadError);
      setUploadError('');
    }
  }, [uploadError]);

  const { data: session } = useSession();
  const signedIn: any = session && session.user;
  accessToken.token = signedIn?.accessToken?.token || '';

  const router = useRouter();

  useEffect(() => {
    if (signedIn?.accessToken?.token) {
      const { role } = signedIn;
      const available = role === 'Super';
      if (!available) {
        message.error('无访问权限');
        router.push('/');
      }
      callFetchRoleList();
    }

  }, [signedIn, router]);
  const onOpenCreateRole = () => {
    setShowCreateRoleModal(true);
  }
  const onCancelModal = () => {
    form.setFieldsValue({});
    setShowCreateRoleModal(false);
  }

  // 提交预设提示词
  const onFinish = async (values: any) => {
    console.log('values', values);
    const productLine = values.productLine.map((p: any) => p.value);
    const roleOptions = values.roleOptions.map((p: any) => {
      const options = !!p.options?.length ? p.options : [];
      return {
        ...p,
        options
      }
    });
    const payload = {
      ...values,
      productLine,
      roleOptions,
      assistant: undefined,
      api: IApiType.openai,
    };
    console.log('result', payload);
    const result = await callAddRole(payload);
    console.log('result', result)
    // onCancelModal();
  };

  const onChange = (values: FormData) => {
    const lastValues = form.getFieldsValue();
  };

  const onFormSubmit = () => {
    form.submit();
  }

  const handleFileChange = async (event: any) => {
    try {
      const file: any = event?.target?.files?.[0];
      console.log('file', file);
      if (file) {
        setIsUploading(true);
        const extension = file.name.split('.').pop();
        uploadPhotoFromClient(file, extension).then(({ url }) => {
          console.log('url', url);
          form.setFieldValue('img', url);
          // setFile(url);
          // 先存到输入框
          // setContent(url);
          // 直接发送
          setIsUploading(false);
        }).catch((error) => {
          setIsUploading(false);
          setUploadError(`Upload Error: ${error.message}`);
        });

      }
    } catch (e) {
      // onError(e as any);
    }
  };

  console.log('columns', columns);


  return (
    <div className="w-full relative flex items-end justify-center flex-col">
      <Button className="my-5" type="default" onClick={onOpenCreateRole}>新增模块</Button>
      <Modal
        title="创建模块"
        centered
        width={800}
        open={showCreateRoleModal}
        onCancel={onCancelModal}
        footer={[
          <Button key="cancel" onClick={onCancelModal}>
            取消
          </Button>,
          <Button key="submit" className="bg-[#202123] select-none items-center rounded-md border border-white/20 text-white transition-colors duration-200 hover:bg-gray-500/10" type="primary" onClick={onFormSubmit}>
            提交
          </Button>,
        ]}
      >
        <Form form={form} onFinish={onFinish} onValuesChange={onChange}>
          <Form.Item
            key="title"
            label="名称"
            name="title"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input
              placeholder="请输入名称"
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item
            key="description"
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input
              placeholder="请输入名称"
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item
            key="example"
            label="示例"
            name="example"
            rules={[{ required: true, message: '请输入示例' }]}
          >
            <Input
              placeholder="请输入示例"
            />
          </Form.Item>
          <Form.Item
            key="mode"
            label="模式"
            name="mode"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Select
              size="middle"
              style={{ width: 200 }}
              options={modeList}
              placeholder="请选择模式"
            />
          </Form.Item>
          <Form.Item
            key="img"
            label="图片"
            name="img"
            rules={[{ required: true, message: '请上传图片' }]}
          >
            <div className="mb-3 flex">
              <Input
                className='flex-1'
                type="file"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </Form.Item>
          <Form.Item
            key="prompt"
            label="提示词"
            name="prompt"
            rules={[{ required: true, message: '请输入提示词' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            key="cost"
            label="消耗算力"
            name="cost"
            rules={[{ required: true, message: '请填写消耗算力' }]}
          >
            <InputNumber
              placeholder="请填写消耗算力"
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item
            key="productLine"
            label="产品线"
          >
            <Form.List name="productLine">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} className="flex flex-wrap text-center relative" align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[{ required: true, message: '请输入选项名称' }]}
                      >
                        <Select
                          size="middle"
                          style={{ width: 150 }}
                          options={productLineOptions}
                          placeholder="请选择产品线"
                        />
                      </Form.Item>
                      <div className='h-[20px] relative'><IconCircleMinus className="cursor-pointer absolute top-1/4" onClick={() => remove(name)} /></div>
                    </Space>
                  ))}
                  <Button className="relative" type="dashed" onClick={() => add()} block icon={<IconCirclePlus />} />
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item label="角色选项">
            <Form.List name="roleOptions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} className="flex flex-wrap text-center relative" align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'label']}
                        style={{ width: 100 }}
                        rules={[{ required: true, message: '请输入选项名称' }]}
                      >
                        <Input placeholder="选项名称" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'width']}
                        rules={[{ required: true, message: '请输入宽度' }]}
                      >
                        <Select
                          size="middle"
                          style={{ width: 70 }}
                          options={widthOptions}
                          placeholder="请选择选项宽度"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        rules={[{ required: true, message: '请输入唯一标识key' }]}
                      >
                        <Input style={{ width: 100 }} placeholder="唯一标识" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        rules={[{ required: true, message: '请选择类型' }]}
                      >
                        <Select
                          size="middle"
                          style={{ width: 100 }}
                          options={roleOptions}
                          placeholder="请选择选项类型"
                        />
                      </Form.Item>
                      <div className="mr-[20px]">
                        <Form.Item label="选择框选项">
                          <Form.List name={[name, 'options']}>
                            {(fields, { add, remove }) => (
                              <>
                                {fields.map(({ key, name, ...restField }) => (
                                  <Space key={key} className="flex flex-wrap text-center relative" align="baseline">
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'label']}
                                      style={{ width: 60 }}
                                      rules={[{ required: true, message: '请输入选项名称' }]}
                                    >
                                      <Input placeholder="选项名称" />
                                    </Form.Item>
                                    <Form.Item
                                      {...restField}
                                      name={[name, 'value']}
                                      style={{ width: 80 }}
                                      rules={[{ required: true, message: '请输入选项key' }]}
                                    >
                                      <Input placeholder="选项key" />
                                    </Form.Item>
                                    <div className='h-[20px] relative'><IconCircleMinus className="cursor-pointer absolute top-1/4" onClick={() => remove(name)} /></div>
                                  </Space>
                                ))}
                                <Button className="relative" type="dashed" onClick={() => add()} block icon={<IconCirclePlus />} />
                              </>
                            )}
                          </Form.List>
                        </Form.Item>
                      </div>
                      <div className='h-[20px] relative'><IconCircleMinus className="cursor-pointer absolute top-1/4" onClick={() => remove(name)} /></div>
                    </Space>
                  ))}
                  <Button className="relative" type="dashed" onClick={() => add()} block icon={<IconCirclePlus />} />
                </>
              )}
            </Form.List>
          </Form.Item>
          <Form.Item
            key="systemPrompt"
            label="系统提示词"
            name="systemPrompt"
          >
            <Input
              placeholder="请输入系统提示词"
              style={{ width: 200 }}
            />
          </Form.Item>
          {/* <Form.Item
            key="assistant"
            label="助手配置"
            name="assistant"
          >
            <Input
              placeholder="请输入名称"
              style={{ width: 200 }}
            />
          </Form.Item> */}
        </Form>
      </Modal>
      <Table
        style={{ width: '100%' }}
        dataSource={roleList}
        columns={columns}
        bordered
      />
    </div>
  )
}