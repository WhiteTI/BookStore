import { t, type UnwrapSchema } from "elysia";

export const UserModel = {
    registerBody: t.Object({
        name: t.String({minLength: 2}),
        email: t.String({format: 'email'}),
        password: t.String({minLength: 8}),
        imageUrl: t.Optional(t.String({format: 'url'})),
    })
}

export type UserModel = {
    [k in keyof typeof UserModel]: UnwrapSchema<typeof UserModel[k]>
}