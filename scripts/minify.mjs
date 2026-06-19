import fs from 'fs';
import path from 'path';
import { minify as minifyHtml } from 'html-minifier-terser';
import { minify as minifyJs } from 'terser';

const distDir = path.resolve('dist');

async function processHtml(filePath) {
  console.log(`Minifying HTML: ${filePath}...`);
  const original = fs.readFileSync(filePath, 'utf8');
  const originalSize = Buffer.byteLength(original, 'utf8');
  
  const minified = await minifyHtml(original, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    processConditionalComments: true,
  });
  
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  fs.writeFileSync(filePath, minified, 'utf8');
  return { originalSize, minifiedSize };
}

async function processJs(filePath) {
  console.log(`Minifying JS: ${filePath}...`);
  const original = fs.readFileSync(filePath, 'utf8');
  const originalSize = Buffer.byteLength(original, 'utf8');
  
  const result = await minifyJs(original, {
    compress: {
      dead_code: true,
      drop_debugger: true,
      conditionals: true,
      evaluate: true,
      booleans: true,
      loops: true,
      unused: true,
      hoist_funs: true,
      keep_fargs: false,
      hoist_vars: true,
      if_return: true,
      join_vars: true,
    },
    mangle: true,
  });
  
  if (result.error) {
    throw result.error;
  }
  
  const minified = result.code;
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  fs.writeFileSync(filePath, minified, 'utf8');
  return { originalSize, minifiedSize };
}

async function processJson(filePath) {
  console.log(`Minifying JSON: ${filePath}...`);
  const original = fs.readFileSync(filePath, 'utf8');
  const originalSize = Buffer.byteLength(original, 'utf8');
  
  const parsed = JSON.parse(original);
  const minified = JSON.stringify(parsed);
  
  const minifiedSize = Buffer.byteLength(minified, 'utf8');
  fs.writeFileSync(filePath, minified, 'utf8');
  return { originalSize, minifiedSize };
}

async function main() {
  if (!fs.existsSync(distDir)) {
    console.error(`Error: ${distDir} does not exist. Run a build first.`);
    process.exit(1);
  }

  let totalOriginal = 0;
  let totalMinified = 0;

  try {
    // 1. Minify index.html (which contains inlined HTML, CSS, and JS)
    const htmlPath = path.join(distDir, 'index.html');
    if (fs.existsSync(htmlPath)) {
      const stats = await processHtml(htmlPath);
      totalOriginal += stats.originalSize;
      totalMinified += stats.minifiedSize;
    }

    // 2. Minify sw.js (service worker JS)
    const swPath = path.join(distDir, 'sw.js');
    if (fs.existsSync(swPath)) {
      const stats = await processJs(swPath);
      totalOriginal += stats.originalSize;
      totalMinified += stats.minifiedSize;
    }

    // 3. Minify manifest.json (manifest JSON)
    const manifestPath = path.join(distDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const stats = await processJson(manifestPath);
      totalOriginal += stats.originalSize;
      totalMinified += stats.minifiedSize;
    }

    const saved = totalOriginal - totalMinified;
    const percentage = ((saved / totalOriginal) * 100).toFixed(2);
    
    console.log('\n--- Minification Summary ---');
    console.log(`Total Original Size: ${(totalOriginal / 1024).toFixed(2)} KB`);
    console.log(`Total Minified Size: ${(totalMinified / 1024).toFixed(2)} KB`);
    console.log(`Total Saved: ${(saved / 1024).toFixed(2)} KB (${percentage}%)`);
    console.log('----------------------------\n');

  } catch (err) {
    console.error('Error during minification:', err);
    process.exit(1);
  }
}

main();
