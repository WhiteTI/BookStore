import { Elysia, t } from "elysia";
import {AuthModel} from "./model";
import {AuthService} from "./service";

const auth = new Elysia({prefix: '/auth'})
    .post(
        '/login',
        async ({body, cookie: {session}, status}) => {
            const response = await AuthService.login(body.email, body.password)

            if (!response)
                throw status(400, 'Invalid username or password')

            session.set({
                value: response.token,
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24 * 10
            })

            return {
                message: 'Login success!',
                data: response
            }
        }, {
            body:  AuthModel.logInBody
        }
    )
    .post(
        '/logout',
        async ({cookie: {session}, status}) => {
            if (!session)
                throw status(401)

            const token = session.value

            const res = await AuthService.logout(token)

            if (!res)
                throw status(401)

            session.remove()

            return 'Logout success!'
        },
        {
            cookie: t.Cookie({
                session: t.String(),
            })
        }
    )
    .get(
        '/refresh',
        async () => {}
    )

export default auth;