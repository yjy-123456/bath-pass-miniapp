const { cloud, db, fail, findOne, getOrCreateUser, ok } = require('./_shared/db');
const { maskPhone } = require('./_shared/package');

function normalizePhone(phoneNumber) {
  return String(phoneNumber || '').replace(/\s+/g, '');
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const phoneNumber = normalizePhone(event && event.phoneNumber);

  if (!/^1\d{10}$/.test(phoneNumber)) {
    return fail('请输入 11 位手机号', 'INVALID_PHONE');
  }

  await getOrCreateUser(OPENID);

  const now = new Date();
  const phoneNumberMasked = maskPhone(phoneNumber);
  const existing = await findOne('users', { openid: OPENID });
  const firstBoundAt = existing && existing.phoneBoundAt ? existing.phoneBoundAt : now;

  await db.collection('users').doc(existing._id).update({
    data: {
      phoneNumber,
      phoneNumberMasked,
      phoneBoundAt: firstBoundAt,
      phoneUpdatedAt: now,
      phoneBindMode: 'demo_manual',
      updatedAt: now,
    },
  });

  return ok({
    hasPhone: true,
    phoneNumberMasked,
    bindMode: 'demo_manual',
  });
};
