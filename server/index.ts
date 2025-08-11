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

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    // Production static file serving with multiple fallback paths
    console.log("=== PRODUCTION MODE DEBUGGING ===");
    console.log("Current working directory:", process.cwd());
    console.log("Available directories:");
    
    // Check multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), "public"),
      path.join(process.cwd(), "dist", "public"),
      path.join(__dirname, "public"),
      path.join(__dirname, "..", "public")
    ];
    
    let publicPath = null;
    for (const testPath of possiblePaths) {
      console.log(`Checking: ${testPath} - exists: ${fs.existsSync(testPath)}`);
      if (fs.existsSync(testPath)) {
        const files = fs.readdirSync(testPath);
        console.log(`Files in ${testPath}:`, files);
        if (files.length > 0) {
          publicPath = testPath;
          break;
        }
      }
    }
    
    if (publicPath) {
      console.log(`Using static path: ${publicPath}`);
      app.use(express.static(publicPath, {
        maxAge: '1d',
        etag: false
      }));
    } else {
      console.error("ERROR: No public directory found!");
    }
    
    // Catch-all for React router
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

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
