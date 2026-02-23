import { Elysia } from "elysia";

const auth = new Elysia({prefix: '/auth'})
    .post(
        '/login',
        async () => {}
    )
    .post(
        '/logout',
        async () => {}
    )
    .get(
        '/refresh',
        async () => {}
    )