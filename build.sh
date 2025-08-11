#!/bin/bash
# Build script for Vercel deployment

echo "Starting build process..."
vite build

echo "Creating output directory structure..."
mkdir -p dist

echo "Copying files from dist/public to dist..."
cp -r dist/public/* dist/

echo "Build complete. Files in dist:"
ls -la dist/

echo "Verifying index.html exists:"
ls -la dist/index.html