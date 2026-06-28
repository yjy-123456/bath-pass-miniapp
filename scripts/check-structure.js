const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'project.config.json',
  'miniprogram/app.js',
  'miniprogram/app.json',
  'miniprogram/pages/home/index.js',
  'miniprogram/pages/product/index.js',
  'miniprogram/pages/pay-result/index.js',
  'miniprogram/pages/coupons/index.js',
  'miniprogram/pages/coupon-code/index.js',
  'miniprogram/pages/staff/index/index.js',
  'miniprogram/pages/staff/confirm/index.js',
  'miniprogram/pages/staff/records/index.js',
  'cloudfunctions/getProducts/index.js',
  'cloudfunctions/getProfile/index.js',
  'cloudfunctions/bindPhoneNumber/index.js',
  'cloudfunctions/login/index.js',
  'cloudfunctions/seedDemoData/index.js',
  'cloudfunctions/createOrder/index.js',
  'cloudfunctions/mockPayOrder/index.js',
  'cloudfunctions/getMyCoupons/index.js',
  'cloudfunctions/generateRedeemCode/index.js',
  'cloudfunctions/checkRedeemCode/index.js',
  'cloudfunctions/redeemCoupon/index.js',
  'cloudfunctions/getTodayRedeems/index.js',
];

for (const file of requiredFiles) {
  assert.ok(fs.existsSync(path.join(root, file)), `Missing ${file}`);
}

const appJson = JSON.parse(fs.readFileSync(path.join(root, 'miniprogram/app.json'), 'utf8'));
for (const page of appJson.pages) {
  assert.ok(fs.existsSync(path.join(root, 'miniprogram', `${page}.js`)), `Missing page JS for ${page}`);
  assert.ok(fs.existsSync(path.join(root, 'miniprogram', `${page}.wxml`)), `Missing page WXML for ${page}`);
  assert.ok(fs.existsSync(path.join(root, 'miniprogram', `${page}.wxss`)), `Missing page WXSS for ${page}`);
  assert.ok(fs.existsSync(path.join(root, 'miniprogram', `${page}.json`)), `Missing page JSON for ${page}`);
}

const cloudRoot = path.join(root, 'cloudfunctions');
const cloudFunctions = requiredFiles
  .filter((file) => file.startsWith('cloudfunctions/'))
  .map((file) => file.split('/')[1]);

for (const name of cloudFunctions) {
  assert.ok(fs.existsSync(path.join(cloudRoot, name, '_shared/db.js')), `Missing deployed shared db for ${name}`);
  assert.ok(fs.existsSync(path.join(cloudRoot, name, '_shared/business.js')), `Missing deployed shared business for ${name}`);
  assert.ok(fs.existsSync(path.join(cloudRoot, name, 'package.json')), `Missing package.json for ${name}`);
}

console.log(`Structure check passed for ${appJson.pages.length} pages and ${cloudFunctions.length} cloud functions.`);
