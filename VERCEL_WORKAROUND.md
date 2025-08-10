# Vercel Deployment Workaround

## Issue Identified
- Vite builds to `dist/public/` (due to vite.config.ts)
- Vercel expects files directly in `dist/`
- Cannot modify vite.config.ts (protected file)

## Solution Applied
Updated vercel.json with a workaround build command:
```json
{
  "buildCommand": "vite build && cp -r dist/public/* dist/ || mkdir -p dist && cp -r dist/public/* dist/",
  "outputDirectory": "dist",
  ...
}
```

This:
1. Runs `vite build` (creates files in dist/public/)
2. Copies all files from dist/public/ to dist/
3. Vercel finds files in the expected dist/ location

## Alternative Simple Solution
If the above doesn't work, use this simpler vercel.json:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## Expected Result
✅ Successful Vercel deployment with frontend demo