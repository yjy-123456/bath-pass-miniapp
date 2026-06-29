const { cloud, db, ok } = require('./_shared/db');
const { createContactSnapshot } = require('./_shared/package');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const result = await db.collection('orders')
    .where({ openid: OPENID })
    .orderBy('createdAt', 'desc')
    .get();

  const userResult = await db.collection('users').where({ openid: OPENID }).limit(1).get();
  const user = userResult.data[0] || {};
  const fallbackSnapshot = user.phoneNumber ? createContactSnapshot(user.phoneNumber) : {};

  const orders = result.data.map((order) => ({
    ...fallbackSnapshot,
    ...order,
    contactPhoneSnapshot: order.contactPhoneSnapshot || fallbackSnapshot.contactPhoneSnapshot || '',
    contactPhoneMaskedSnapshot: order.contactPhoneMaskedSnapshot || fallbackSnapshot.contactPhoneMaskedSnapshot || '',
  }));

  return ok({ orders });
};
