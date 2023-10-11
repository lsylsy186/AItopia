// import { EntityId, Repository, Schema } from 'redis-om';
import { Redis } from '@upstash/redis';

export function generateRandomSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class RedisClient {
  private client: Redis;

  constructor(client: any) {
    this.client = client;
  }

  async new(email: string): Promise<number> {
    const code = generateRandomSixDigitNumber();
    const result = await this.client.set(email, JSON.stringify({ code }), {
      ex: 10 * 60,
    });
    return code;
  }

  async valid(email: string, code: string): Promise<boolean> {
    const result: any = await this.client.get(email);
    if (!result) return false;
    const storedCode = String(result.code);
    return storedCode === code;
  }
};

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export const redisClient = new RedisClient(redis);