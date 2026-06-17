import { Router } from "express"
import prisma from "../db/client.js"
import { authMiddleware } from "../middleware/auth.js"
import type { AuthRequest } from "../middleware/auth.js"

const router = Router()

router.use(authMiddleware)

router.get("/", async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
    })
    res.json(projects)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string
    const project = await prisma.project.findFirst({
      where: { id, userId: req.userId },
    })
    if (!project) {
      res.status(404).json({ error: "Project not found" })
      return
    }
    res.json(project)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { name, tree } = req.body
    if (!name) {
      res.status(400).json({ error: "Project name required" })
      return
    }
    const project = await prisma.project.create({
      data: {
        name,
        tree: tree ?? [],
        userId: req.userId!,
      },
    })
    res.status(201).json(project)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.userId },
    })
    if (!existing) {
      res.status(404).json({ error: "Project not found" })
      return
    }
    const project = await prisma.project.update({
      where: { id },
      data: { name: req.body.name ?? existing.name, tree: req.body.tree ?? existing.tree },
    })
    res.json(project)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string
    const existing = await prisma.project.findFirst({
      where: { id, userId: req.userId },
    })
    if (!existing) {
      res.status(404).json({ error: "Project not found" })
      return
    }
    await prisma.project.delete({ where: { id } })
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

export default router
