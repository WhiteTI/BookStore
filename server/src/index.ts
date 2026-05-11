import { Elysia } from "elysia";
import auth from "./modules/auth";
import user from "./modules/user";

const app = new Elysia()
    .use(auth)
    .use(user)
    .get("/", () => "Hello Elysia").listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
