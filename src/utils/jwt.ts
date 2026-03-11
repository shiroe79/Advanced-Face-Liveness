import { createSecretKey } from 'crypto'
import env from '../../env.ts'
import { SignJWT } from 'jose'
import type { JWTPayload } from 'jose'

export interface JwtPayload extends JWTPayload {
    id: string
    email: string
}

export const generateToken = (payload: JwtPayload) => {
    const secret = env.JWT_SECRET
    const secretKey = createSecretKey(secret, 'utf-8')

    return new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN || '7d')
    .sign(secretKey)

}