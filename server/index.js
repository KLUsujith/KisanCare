import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import diagnoseRouter from "./routes/diagnose.js";
import marketRouter from "./routes/market.js";
import facilitiesRouter from "./routes/facilities.js";
import analyticsRouter from "./routes/analytics.js";
import authRouter from "./routes/auth.js";
import advisoryRouter from "./routes/advisory.js";
import seedsRouter from "./routes/seeds.js";
import myfarmRouter from "./routes/myfarm.js";
import adminRouter from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    platform: "KisanSetu (किसान सेतु)",
    version: "1.0.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/diagnose", diagnoseRouter);
app.use("/api/advisory", advisoryRouter);
app.use("/api/seeds", seedsRouter);
app.use("/api/myfarm", myfarmRouter);
app.use("/api/admin", adminRouter);
app.use("/api", marketRouter);
app.use("/api", facilitiesRouter);
app.use("/api/analytics", analyticsRouter);

// Serve static frontend in production if built
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith("index.html")) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
  }
}));

// Fallback for SPA routing (do not serve index.html for missing assets)
app.get("*", (req, res) => {
  if (req.url.startsWith("/api") || req.url.startsWith("/assets") || path.extname(req.url)) {
    return res.status(404).send("Resource not found");
  }
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const indexPath = path.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send("KisanCare Backend API is active on port " + PORT + ".");
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌾 KisanSetu Server running on http://localhost:${PORT}`);
  console.log(`🌱 API Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
