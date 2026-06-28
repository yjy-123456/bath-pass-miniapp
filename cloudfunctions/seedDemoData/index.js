const { cloud, db, ok } = require('./_shared/db');
const { demoProducts, storeInfo } = require('./_shared/package');

const collections = [
  'users',
  'products',
  'orders',
  'coupons',
  'redeemCodes',
  'staff',
  'redeemLogs',
  'settings',
];

async function ensureCollection(name) {
  try {
    await db.createCollection(name);
  } catch (error) {
    if (!String(error.message || '').includes('already exists')) {
      throw error;
    }
  }
}

async function upsertById(collectionName, id, data) {
  const collection = db.collection(collectionName);
  const { _id, ...safeData } = data;
  try {
    await collection.doc(id).set({ data: safeData });
  } catch (error) {
    await collection.doc(id).update({ data: safeData });
  }
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const now = new Date();

  await Promise.all(collections.map(ensureCollection));

  await Promise.all(demoProducts.map((product) => upsertById('products', product._id, {
    ...product,
    createdAt: now,
    updatedAt: now,
  })));

  await upsertById('settings', 'store', {
    ...storeInfo,
    updatedAt: now,
  });

  await upsertById('staff', OPENID, {
    openid: OPENID,
    name: 'Demo 店员',
    role: 'admin',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });

  return ok({
    message: 'Demo 数据已初始化，当前微信 openid 已加入店员白名单。',
    staffOpenid: OPENID,
    productCount: demoProducts.length,
  });
};
