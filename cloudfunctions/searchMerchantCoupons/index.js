const { cloud, db, fail, ok, requireStaff } = require('./_shared/db');
const { createContactSnapshot } = require('./_shared/package');

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { phoneKeyword = '', status = '' } = event || {};

  try {
    await requireStaff(OPENID);
  } catch (error) {
    return fail(error.message, error.code);
  }

  const where = {};
  if (status) where.status = status;
  if (phoneKeyword) {
    where.contactPhoneSnapshot = db.RegExp({
      regexp: escapeRegExp(phoneKeyword),
      options: 'i',
    });
  }

  const result = await db.collection('coupons')
    .where(where)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  const userOpenids = Array.from(new Set(result.data
    .filter((coupon) => !coupon.contactPhoneMaskedSnapshot && coupon.openid)
    .map((coupon) => coupon.openid)));

  const userPhoneMap = {};
  await Promise.all(userOpenids.map(async (openid) => {
    const userResult = await db.collection('users').where({ openid }).limit(1).get();
    const user = userResult.data[0];
    if (user && user.phoneNumber) {
      userPhoneMap[openid] = createContactSnapshot(user.phoneNumber);
    }
  }));

  const coupons = result.data.map((coupon) => {
    const fallbackSnapshot = userPhoneMap[coupon.openid] || {};
    return {
      ...fallbackSnapshot,
      ...coupon,
      contactPhoneSnapshot: coupon.contactPhoneSnapshot || fallbackSnapshot.contactPhoneSnapshot || '',
      contactPhoneMaskedSnapshot: coupon.contactPhoneMaskedSnapshot || fallbackSnapshot.contactPhoneMaskedSnapshot || '',
    };
  });

  return ok({ coupons });
};
