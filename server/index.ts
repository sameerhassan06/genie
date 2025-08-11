import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    console.log("=== PRODUCTION MODE DEBUGGING ===");
    console.log("Current working directory:", process.cwd());
    console.log("__dirname:", __dirname);
    
    const possiblePaths = [
      path.join(process.cwd(), "public"),
      path.join(process.cwd(), "dist", "public"),
      path.join(__dirname, "public"),
      path.join(__dirname, "..", "public"),
      "/app/public",
      "/app/dist/public"
    ];
    
    let publicPath = null;
    for (const testPath of possiblePaths) {
      console.log(`Checking: ${testPath} - exists: ${fs.existsSync(testPath)}`);
      if (fs.existsSync(testPath)) {
        try {
          const files = fs.readdirSync(testPath);
          console.log(`Files in ${testPath}:`, files);
          if (files.length > 0 && files.some(f => f === 'index.html' || f.endsWith('.html'))) {
            publicPath = testPath;
            console.log(`✅ Found valid static files at: ${publicPath}`);
            break;
          }
        } catch (error) {
          console.log(`Error reading ${testPath}:`, error.message);
        }
      }
    }
    
    if (publicPath) {
      console.log(`🚀 Serving static files from: ${publicPath}`);
      app.use(express.static(publicPath, {
        maxAge: '1d',
        etag: false,
        index: 'index.html'
      }));
    } else {
      console.error("❌ ERROR: No valid public directory found!");
    }
    
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      
      console.log(`Serving React app for: ${req.path}`);
      
      if (publicPath) {
        const indexPath = path.join(publicPath, "index.html");
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("index.html not found");
        }
      } else {
        res.status(500).send("Static files directory not found");
      }
    });
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  });
})();
