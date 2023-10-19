import useRoleService from '@/services/useRoleService';
import { useState } from 'react';

export const useRole = () => {
  const { fetchRoles, addRole } = useRoleService();
  const [roleList, setRoleList] = useState<any>([]);

  const callFetchRoleList = async () => {
    const result = await fetchRoles();
    if (result.success && result.data) {
      setRoleList((result.data as any).map((item: any, index: number) => ({
        id: item.id,
        img: item.img,
        productLine: item.productLine,
        title: item.title,
        description: item.description,
        prompt: item.prompt,
        example: item.example,
        api: item.api,
        mode: item.mode,
        systemPrompt: item.systemPrompt,
        assistant: item.assistant,
        cost: item.cost,
        roleOptions: item.roleOptions,
      })));
    }
  }

  const callAddRole = async (payload: {
    img: string;
    productLine: string[],
    title: string,
    description: string,
    prompt: string,
    example: string,
    api: string,
    mode: string,
    systemPrompt: string,
    assistant: any,
    cost: string,
    roleOptions: any
  }) => {
    const result = await addRole(payload);
    return result;
  }

  return {
    roleList,
    callFetchRoleList,
    callAddRole,
  };
};
