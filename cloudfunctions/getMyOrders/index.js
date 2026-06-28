const { cloud, db, ok } = require('./_shared/db');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const result = await db.collection('orders')
    .where({ openid: OPENID })
    .orderBy('createdAt', 'desc')
    .get();

  return ok({ orders: result.data });
};
