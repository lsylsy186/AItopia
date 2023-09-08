import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

interface Payload extends JWTPayload {
  email: string;
}

export async function signJwtAccessToken(
  payload: JWTPayload
): Promise<{ token: string; exp: number }> {
  const iat = Math.floor(Date.now() / 1000); // Not before: Now
  const exp = iat + 7 * 24 * (60 * 60); // Expires: Now + 1 week
  const secret_key = process.env.SECRET_KEY;
  return {
    token: await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime(exp)
      .setIssuedAt(iat)
      .setNotBefore(iat)
      .sign(new TextEncoder().encode(secret_key!)),
    exp,
  };
}

export async function verifyJwt(token: string): Promise<JWTPayload> {
  const secret_key = process.env.SECRET_KEY;
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret_key!)
  );
  return payload;
}
