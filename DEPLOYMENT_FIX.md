# Deployment Fix - Static File Path Correction

## Issue Identified
The container was crashing with "Cannot find package 'vite'" error because:
1. The server expects static files at `dist/public` relative to the server location
2. Our Dockerfile was copying them to `/app/public` instead

## Root Cause
Looking at `server/vite.ts`, the `serveStatic` function resolves the path as:
```typescript
const distPath = path.resolve(import.meta.dirname, "public");
```

Since `import.meta.dirname` points to `/app/dist` (where the compiled server is), it expects static files at `/app/dist/public`.

## Fix Applied
Updated Dockerfile to copy static files to the correct location:
```dockerfile
# Copy static files to where the server expects them (dist/public)
COPY --from=builder /app/dist/public ./dist/public
```

## Next Steps
Push this fix and redeploy:

```bash
git add Dockerfile
git commit -m "Fix static file path for production server"
git push origin main
```

This should resolve the container crash and make your platform accessible at the Coolify URL.