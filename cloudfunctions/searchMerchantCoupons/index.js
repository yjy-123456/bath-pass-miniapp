const { cloud, db, fail, ok, requireStaff } = require('./_shared/db');

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

  return ok({ coupons: result.data });
};
