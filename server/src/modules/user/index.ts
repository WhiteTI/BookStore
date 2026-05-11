import { Elysia } from "elysia";
import {UserService} from "./sevice";
import {UserModel} from "./model";

const user = new Elysia({prefix: '/users'})
    .get(
        '/profile/:id',
        async ({params: {id}, status}) => {
            const user = await UserService.getUser(id)

            if (!user)
                throw status(401)

            return {
                message: '/ᐠ｡ꞈ｡ᐟ\\',
                user: user,
            }
        }
    )
    .post(
        '/registration',
        async ({body, status}) => {
            const user = await UserService.registration(body)

            if (!user)
                throw status('Bad Request')

            return {
                message: 'Registration success!',
                user: user,
            }
        },
        {
            body: UserModel.registerBody
        }
    )

export default user