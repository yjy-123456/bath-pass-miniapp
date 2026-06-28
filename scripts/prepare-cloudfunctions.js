const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cloudRoot = path.join(root, 'cloudfunctions');
const sharedSource = path.join(cloudRoot, '_shared');
const projectShared = path.join(root, 'shared');

function copyFile(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function syncShared(functionDir) {
  const target = path.join(functionDir, '_shared');
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });

  for (const filename of fs.readdirSync(sharedSource)) {
    copyFile(path.join(sharedSource, filename), path.join(target, filename));
  }

  copyFile(path.join(projectShared, 'business.js'), path.join(target, 'business.js'));
  copyFile(path.join(projectShared, 'demoData.js'), path.join(target, 'demoData.js'));

  const packageJson = {
    name: path.basename(functionDir),
    version: '1.0.0',
    main: 'index.js',
    dependencies: {
      'wx-server-sdk': 'latest',
    },
  };
  if (path.basename(functionDir) === 'generateRedeemCode') {
    packageJson.dependencies.qrcode = '^1.5.4';
  }
  fs.writeFileSync(path.join(functionDir, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`);
}

const functions = fs.readdirSync(cloudRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => name !== '_shared');

for (const name of functions) {
  syncShared(path.join(cloudRoot, name));
}

console.log(`Prepared shared modules for ${functions.length} cloud functions.`);
