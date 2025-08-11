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
