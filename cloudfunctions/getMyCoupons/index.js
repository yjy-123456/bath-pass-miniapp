const { cloud, db, ok } = require('./_shared/db');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const result = await db.collection('coupons')
    .where({ openid: OPENID })
    .orderBy('createdAt', 'desc')
    .get();

  const now = new Date();
  const coupons = result.data.map((coupon) => {
    if (coupon.status === 'unused' && new Date(coupon.validTo).getTime() < now.getTime()) {
      return { ...coupon, status: 'expired' };
    }
    return coupon;
  });

  return ok({ coupons });
};
