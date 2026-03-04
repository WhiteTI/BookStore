import type { PrismaClient } from '../../../prisma/generated/client'
import { prisma } from '../../../libs/db'

export abstract class AuthService {
    static async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: {email}
        })

        if (!user)
            return null

        const isPassEquals = await Bun.password.verify(password, user.password)

        if (!isPassEquals)
            return null

        const session = await createSession(prisma)

        await prisma.user.update({
            where: {id: user.id},
            data: {
                session: {
                    connect: {
                        id: session.id,
                    }
                }
            }
        })

        return {
            email: user.email,
            name: user.name,
            image: user.image,
            token: session.token
        }
    }

    static async logout(token: string) {
        const session = await validateSession(prisma, token)

        if (!session)
            return null

        await prisma.session.delete({where: {id: session.id}})
    }

    static async refresh(token: string) {
        const session = await validateSession(prisma, token)

        if (!session)
            return null

        return session
    }
}

interface ISession {
    id: string;
    secretHash: string;
    createdAt: Date;
    lastVerifiedAt: Date;
}

interface ISessionWithToken extends ISession {
    token: string;
}

const INACTIVITY_TIMEOUT_SECONDS = 60 * 60 * 24 * 10; // 10 дней
const ACTIVITY_CHECK_INTERVAL_SECONDS = 60 * 60; // 1 час

async function createSession(db: PrismaClient): Promise<ISessionWithToken> {
    const id = generateSecureRandomString()
    const secret = generateSecureRandomString()
    const secretHash = await hashSecret(secret)

    const token = `${id}.${secret}`

    const newSession = await db.session.create({
        data: {
            id,
            secretHash
        }
    })

    return {
        id,
        secretHash,
        token,
        createdAt: newSession.createAt,
        lastVerifiedAt: newSession.updateAt,
    }
}

async function validateSession(db: PrismaClient, token: string): Promise<ISession | null> {
    const now = new Date();

    const tokenParts = token.split('.')
    if (tokenParts.length !== 2)
        return null

    const sessionId = tokenParts[0];
    const sessionSecret = tokenParts[1];

    const session = await getSession(db, sessionId);

    if (!session)
        return null

    const tokenSecretHash = await hashSecret(sessionSecret)
    const validSecret = constantTimeEqual(tokenSecretHash, session.secretHash)

    if (!validSecret)
        return null

    if (now.getTime() - session.lastVerifiedAt.getTime() >= ACTIVITY_CHECK_INTERVAL_SECONDS * 1000) {
        await db.session.update({
            where: {id: session.id},
            data: {
                secretHash: session.secretHash,
            }
        })
    }

    return session
}

async function getSession(db: PrismaClient, sessionId:  string): Promise<ISession | null> {
    const now = new Date()

    const session = await db.session.findUnique({ where: { id: sessionId } })

    if (!session || !session.id)
        return null

    if (now.getTime() - session.updateAt.getTime() >= INACTIVITY_TIMEOUT_SECONDS * 1000) {
        await deleteSession(db, sessionId)
        return null
    }

    return {
        id: session.id,
        secretHash: session.secretHash,
        createdAt: session.createAt,
        lastVerifiedAt: session.updateAt,
    }
}

async function deleteSession(db: PrismaClient, sessionId:  string): Promise<void> {
    await db.session.delete({where: { id: sessionId }})
}

function generateSecureRandomString(): string {
    const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

    const bytes = new Uint8Array(24)
    crypto.getRandomValues(bytes)

    let id = ''
    for (let i = 0; i < bytes.length; i++) {
        id += alphabet[bytes[i] >> 3]
    }

    return id
}

async function hashSecret(secret : string): Promise<string> {
    const secretBytes = new TextEncoder().encode(secret)
    const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes)
    return new Uint8Array(secretHashBuffer).toBase64()
}

function constantTimeEqual(a: string, b: string): boolean {
    const a8 = Uint8Array.fromBase64(a)
    const b8 = Uint8Array.fromBase64(b)

    if (a8.byteLength !== b8.byteLength)
        return false

    let c = 0
    for (let i = 0; i < a8.byteLength; i++) {
        c |= a8[i] ^ b8[i]
    }

    return c === 0
}