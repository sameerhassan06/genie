#!/usr/bin/env node

// Simple build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Run vite build
  console.log('📦 Running vite build...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Check if dist/public exists
  const distPublicPath = path.join(process.cwd(), 'dist', 'public');
  const distPath = path.join(process.cwd(), 'dist');
  
  if (fs.existsSync(distPublicPath)) {
    console.log('📁 Found dist/public directory');
    
    // Copy files from dist/public to dist
    console.log('📋 Copying files to expected location...');
    const files = fs.readdirSync(distPublicPath);
    
    files.forEach(file => {
      const srcFile = path.join(distPublicPath, file);
      const destFile = path.join(distPath, file);
      
      if (fs.statSync(srcFile).isDirectory()) {
        // Copy directory recursively
        execSync(`cp -r "${srcFile}" "${destFile}"`, { stdio: 'inherit' });
      } else {
        // Copy file
        fs.copyFileSync(srcFile, destFile);
      }
    });
    
    console.log('✅ Files copied successfully');
    console.log('📄 Final dist contents:');
    execSync('ls -la dist/', { stdio: 'inherit' });
  }
  
  console.log('🎉 Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}