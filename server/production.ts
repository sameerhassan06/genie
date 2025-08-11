import express, { type Express } from "express";
import path from "path";
import fs from "fs";

export function setupProduction(app: Express) {
  // Serve static files from the public directory
  const publicPath = path.join(process.cwd(), "public");
  
  // Add detailed logging for debugging
  console.log("Production mode - serving static files from:", publicPath);
  console.log("Directory exists:", fs.existsSync(publicPath));
  
  if (fs.existsSync(publicPath)) {
    const files = fs.readdirSync(publicPath);
    console.log("Files in public directory:", files);
    
    // Serve static files
    app.use(express.static(publicPath));
    
    // Catch-all handler: send back React's index.html file for any non-API routes
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
      }
      
      const indexPath = path.join(publicPath, "index.html");
      console.log("Serving index.html for route:", req.path);
      
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application not found - build files missing");
      }
    });
  } else {
    console.error("Public directory not found:", publicPath);
    app.get("*", (req, res) => {
      res.status(500).send("Static files not found - deployment error");
    });
  }
}