import { Injectable } from '@nestjs/common';
import { verify, sign, SignOptions } from 'jsonwebtoken';
import { UserRoles } from '@common';
import { hash, verify as verifyArgon2 } from 'argon2';

export interface LoginPayload {
    userId: number;
    email: string;
    role: UserRoles;
};

@Injectable()
export class AuthLibService {
    generateToken(payload: LoginPayload, options?: SignOptions): string {
        const token = sign(payload, process.env.SALT_AUTH_JWT, options);
        return token;
    }

    verifyToken(token: string): LoginPayload {
        try {
            return verify(token, process.env.SALT_AUTH_JWT) as LoginPayload;
        } catch {
            return null;
        }
    }

    async hashPassword(password: string) {
            const salt = Buffer.from(process.env.SALT_AUTH_ARGON2, 'utf-8');
            const hashedPassword = await hash(password, { salt });
            return hashedPassword;
        }

}
