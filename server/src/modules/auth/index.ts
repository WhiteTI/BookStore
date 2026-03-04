import { Elysia, status } from "elysia";
import {AuthModel} from "./model";
import {AuthService} from "./service";

const auth = new Elysia({prefix: '/auth'})
    .post(
        '/login',
        async ({body, cookie: {session}}) => {
            const response = await AuthService.login(body.email, body.password)

            if (!response)
                throw status(400, 'Invalid username or password')

            session!.value = response.token

            return response
        }, {
            body:  AuthModel.logInBody
        }
    )
    .post(
        '/logout',
        async () => {}
    )
    .get(
        '/refresh',
        async () => {}
    )

export default auth;