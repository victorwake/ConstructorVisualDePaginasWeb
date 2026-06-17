import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { resolve } from "path"
import { fileURLToPath } from "url"

const dir = fileURLToPath(new URL("../..", import.meta.url))
const dbPath = resolve(dir, "dev.db")

const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

export default prisma
