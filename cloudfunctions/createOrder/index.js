const { cloud, db, fail, getById, ok } = require('./_shared/db');
const { computeOrderTotal, makeOrderNo, snapshotProduct } = require('./_shared/package');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { productId, quantity = 1 } = event || {};
  const qty = Number(quantity);

  if (!productId || !Number.isInteger(qty) || qty < 1 || qty > 9) {
    return fail('请选择有效套餐和购买数量');
  }

  const product = await getById('products', productId);
  if (!product || product.status !== 'active') {
    return fail('套餐不存在或已下架', 'PRODUCT_UNAVAILABLE');
  }

  const now = new Date();
  const totalFeeFen = computeOrderTotal(product, qty);
  const order = {
    orderNo: makeOrderNo(now),
    openid: OPENID,
    productId,
    productSnapshot: snapshotProduct(product),
    quantity: qty,
    totalFeeFen,
    status: 'pending',
    payMode: 'mock',
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await db.collection('orders').add({ data: order });

  return ok({
    orderId: result._id,
    order: { _id: result._id, ...order },
  });
};
