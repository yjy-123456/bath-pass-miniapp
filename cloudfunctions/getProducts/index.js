const { db, ok } = require('./_shared/db');

exports.main = async () => {
  const products = await db.collection('products')
    .where({ status: 'active' })
    .orderBy('sort', 'asc')
    .get()
    .catch(() => ({ data: [] }));
  const storeResult = await db.collection('settings')
    .doc('store')
    .get()
    .catch(() => ({ data: null }));

  return ok({
    products: products.data,
    store: storeResult.data,
  });
};
