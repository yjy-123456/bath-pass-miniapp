const { cloud, db, fail, getById, ok } = require('./_shared/db');
const { createCouponDrafts } = require('./_shared/package');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { orderId } = event || {};
  if (!orderId) return fail('缺少订单编号');

  const order = await getById('orders', orderId);
  if (!order || order.openid !== OPENID) return fail('订单不存在', 'ORDER_NOT_FOUND');
  if (order.status === 'closed') return fail('订单已关闭', 'ORDER_CLOSED');

  const existingCoupons = await db.collection('coupons').where({ orderId }).get();
  if (order.status === 'paid' && existingCoupons.data.length) {
    return ok({ orderId, couponCount: existingCoupons.data.length, message: '订单已支付并已发券' });
  }

  const product = await getById('products', order.productId);
  if (!product) return fail('套餐不存在，无法发券', 'PRODUCT_NOT_FOUND');

  const now = new Date();
  await db.collection('orders').doc(orderId).update({
    data: {
      status: 'paid',
      paidAt: now,
      updatedAt: now,
    },
  });

  const drafts = createCouponDrafts({
    orderId,
    orderNo: order.orderNo,
    openid: OPENID,
    product,
    quantity: order.quantity,
    paidAt: now,
  });

  await Promise.all(drafts.map((coupon) => db.collection('coupons').add({ data: coupon })));

  return ok({
    orderId,
    couponCount: drafts.length,
    message: '模拟支付成功，电子券已发放。',
  });
};
