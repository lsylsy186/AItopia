import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { method, body } = req;
    let whereClause = {};
    switch (method) {
      case 'GET':
        const result = await prisma.role.findMany({
          where: whereClause,
          select: {
            id: true,
            img: true,
            imgAlt: true,
            title: true,
            description: true,
            index: true,
            prompt: true,
            example: true,
            api: true,
            mode: true,
            systemPrompt: true,
            assistant: true,
            cost: true,
            roleOptions: true,
          }
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
            imgAlt: body.imgAlt,
            title: body.title,
            description: body.description,
            index: body.index,
            prompt: body.prompt,
            example: body.example,
            api: body.api,
            mode: body.mode,
            systemPrompt: body.systemPrompt,
            assistant: body.assistant,
            cost: body.cost,
            roleOptions: body.roleOptions,
          },
        });

        res.status(200).json({
          success: true,
          message: '请求成功',
          data: response
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