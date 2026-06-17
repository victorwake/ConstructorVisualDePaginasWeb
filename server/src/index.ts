import "dotenv/config"
import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import projectRoutes from "./routes/projects.js"
import prisma from "./db/client.js"

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: "10mb" }))

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

app.get("/p/:slug", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug as string },
      select: { publishedHtml: true, published: true },
    })
    if (!project || !project.published || !project.publishedHtml) {
      res.status(404).send("<h1>Not found</h1>")
      return
    }
    res.type("html").send(project.publishedHtml)
  } catch (err) {
    console.error(err)
    res.status(500).send("<h1>Server error</h1>")
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
