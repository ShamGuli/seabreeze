const fs = require('fs');
const path = require('path');

const cesiumSource = path.join(__dirname, '..', 'node_modules', 'cesium', 'Build', 'Cesium');
const cesiumDest = path.join(__dirname, '..', 'public', 'cesium');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const dirs = ['Workers', 'ThirdParty', 'Assets', 'Widgets'];

for (const dir of dirs) {
  const src = path.join(cesiumSource, dir);
  const dest = path.join(cesiumDest, dir);
  if (fs.existsSync(src)) {
    console.log(`Copying ${dir}...`);
    copyDir(src, dest);
  } else {
    console.warn(`Warning: ${src} not found`);
  }
}

console.log('Cesium static assets copied to public/cesium/');
