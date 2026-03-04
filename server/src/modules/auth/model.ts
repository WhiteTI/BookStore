import { t } from 'elysia'

export const AuthModel = {
    logInBody: t.Object({
        email: t.String({format: 'email'}),
        password: t.String({minLength: 8}),
    }),
} as const;