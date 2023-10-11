import prisma from "@/lib/prismadb";
import { NextApiRequest, NextApiResponse } from 'next';
import * as bcrypt from 'bcrypt';
import { signJwtAccessToken } from "@/lib/jwt";

interface RequestBody {
  username: string;
  password: string;
  productLine: string;
  role: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  try {
    const body = req.body as RequestBody;
    const user = await prisma.user.findFirst({
      where: {
        email: body?.username,
      }
    });
    const available = user && (user.role === 'Super' || user.productLine.toLowerCase() === body.productLine.toLowerCase());
    if (!available) {
      res.status(500).json({});
    }
    if (user && (await bcrypt.compare(body?.password, user.password))) {
      const { password, ...userWithoutPass } = user;
      const accessToken = await signJwtAccessToken(userWithoutPass);

      const result = {
        ...userWithoutPass,
        accessToken
      };
      res.status(200).json(JSON.stringify(result));
    } else {
      res.status(500).json({});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error' })
  }
};

export default handler;