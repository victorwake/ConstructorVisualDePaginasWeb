import { Router } from "express"
import prisma from "../db/client.js"
import { authMiddleware } from "../middleware/auth.js"
import type { AuthRequest } from "../middleware/auth.js"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, email: true } } },
    })
    res.json(templates)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, node } = req.body
    if (!name || !node) {
      res.status(400).json({ error: "Name and node required" })
      return
    }
    const template = await prisma.template.create({
      data: { name, description: description || null, node, authorId: req.userId! },
    })
    res.status(201).json(template)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string
    const existing = await prisma.template.findFirst({
      where: { id, authorId: req.userId },
    })
    if (!existing) {
      res.status(404).json({ error: "Template not found" })
      return
    }
    await prisma.template.delete({ where: { id } })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
