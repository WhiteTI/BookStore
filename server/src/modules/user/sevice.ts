import type {UserModel} from "./model";
import {prisma} from "../../../libs/db";

export abstract class UserService {
    static async registration({email, name, password, imageUrl}: UserModel['registerBody']) {
        const emailIsExist = await prisma.user.findUnique({where: {email}})

        if (emailIsExist)
            return null

        const hashPass = await Bun.password.hash(password)

        const newUser = await prisma.user.create({
            data: {
                image: imageUrl,
                password: hashPass,
                email,
                name,
            }
        })

        const newCart = await prisma.cart.create({
            data: {
                user: {
                    connect: {
                        id: newUser.id,
                    }
                }
            }
        })

        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            image: newUser.image,
            cart: newCart.id,
        }
    }

    static async getUser(id: string) {
        const user = await prisma.user.findUnique({where: {id}})

        if (!user)
            return null

        return {
            name: user.name,
            email: user.email,
            image: user.image,
            cart: user.cartId
        }
    }
}