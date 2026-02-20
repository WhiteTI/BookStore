import { PrismaLibSql } from "@prisma/adapter-libsql"
import {PrismaClient} from "../prisma/generated/client";

const adapter = new PrismaLibSql({url: process.env.DATABASE_URL || ''})
export const prisma = new PrismaClient({adapter})