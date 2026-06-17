import prisma from "./src/db/client.js"
import bcrypt from "bcryptjs"

const email = process.argv[2] || "demo@test.com"
const password = process.argv[3] || "demo123"
const name = process.argv[4] || "Demo User"

const hash = await bcrypt.hash(password, 10)
const user = await prisma.user.upsert({
  where: { email },
  update: {},
  create: { email, password: hash, name },
})

console.log(`✓ User created: ${user.email} (password: ${password})`)

await prisma.$disconnect()
