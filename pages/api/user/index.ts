import prisma from '@/lib/prismadb';
import * as bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { IResponse } from '@/types/response';
import { withPrismaError } from '@/hooks/withPrismaError';
import { redisClient } from '@/lib/redis';

interface RequestBody {
  name: string;
  email: string;
  password: string;
  code?: string;
  productLine: any;
  verify: boolean;
}


const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const body = req.body as RequestBody;
  if (body.verify) {
    const isValid = await redisClient.valid(body.email, body?.code || '');
    if (!isValid) {
      res.status(500).end({ error: 'Invalid code' });
    }
  }

  const existUser = await prisma.user.findMany({
    where: {
      OR: [{ email: body.email }],
    },
  });
  if (existUser.length > 0) {
    res.status(500).end({ error: 'User already exists' });
  }

  const user = await prisma.user.create({
    data: {
      name: body?.name,
      email: body?.email,
      password: await bcrypt.hash(body?.password, 10),
      account: {
        create: {
          balance: 5
        }
      },
      productLine: body?.productLine || 'Normal',
    }
  });
  const { password, ...result } = user;
  res.status(200).json({
    success: true,
    message: '请求成功',
    data: result
  } as IResponse);
}

export default withPrismaError(handler);