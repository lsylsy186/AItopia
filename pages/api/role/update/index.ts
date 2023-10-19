import prisma from "@/lib/prismadb";
import { IResponse } from '@/types/response';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const { method, body } = req;
    switch (method) {
      case 'POST':
        const response = await prisma.role.update({
          where: {
            id: body.id,
          },
          data: {
            img: body.img,
            productLine: body.productLine,
            title: body.title,
            description: body.description,
            prompt: body.prompt,
            example: body.example,
            cost: body.cost,
            systemPrompt: body.systemPrompt,
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