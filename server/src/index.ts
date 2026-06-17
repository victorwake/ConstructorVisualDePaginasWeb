import "dotenv/config"
import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import projectRoutes from "./routes/projects.js"

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json({ limit: "10mb" }))

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
