import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { method, body } = req;
    switch (method) {
      case 'GET':
        const result = await prisma.role.findMany({
          include: {
            roleOptions: {
              include: {
                options: true,
              },
            },
          },
        });
        res.status(200).json({
          success: true,
          message: '请求成功',
          data: result
        } as IResponse);
        break
      case 'POST':
        const response = await prisma.role.create({
          data: {
            img: body.img,
            productLine: body.productLine,
            title: body.title,
            description: body.description,
            prompt: body.prompt,
            example: body.example,
            api: body.api,
            mode: body.mode,
            systemPrompt: body.systemPrompt,
            assistant: body.assistant,
            cost: body.cost,
            roleOptions: {
              create: body.roleOptions.map((option: any) => ({
                label: option.label,
                key: option.key,
                type: option.type,
                width: option.width,
                options: {
                  create: option.options.map((opt: any) => ({
                    label: opt.label,
                    value: opt.value,
                    prompt: opt.prompt || null
                  }))
                }
              }))
            }
          },
        });

        res.status(200).json({
          success: true,
          message: '请求成功',
          data: response
        } as IResponse);
        break
      case 'DELETE':
        const deleteResponse = await prisma.role.delete({
          where: { id: Number(body.id) },
        });
        res.status(200).json({
          success: true,
          message: '请求成功',
          data: deleteResponse
        } as IResponse);
        break
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
}

export default handler;