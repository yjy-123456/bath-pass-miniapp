const { cloud, db, fail, findOne, getOrCreateUser, ok } = require('./_shared/db');
const { maskPhone } = require('./_shared/package');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { code } = event || {};
  if (!code) return fail('手机号授权已过期，请重新授权。', 'PHONE_CODE_REQUIRED');

  await getOrCreateUser(OPENID);

  let phoneInfo;
  try {
    phoneInfo = await cloud.openapi.phonenumber.getPhoneNumber({ code });
  } catch (error) {
    return fail('手机号绑定失败，请稍后重试。', 'PHONE_BIND_FAILED');
  }

  const phoneNumber = phoneInfo.phoneInfo && phoneInfo.phoneInfo.phoneNumber;
  if (!phoneNumber) return fail('手机号绑定失败，请稍后重试。', 'PHONE_EMPTY');

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
      updatedAt: now,
    },
  });

  return ok({
    hasPhone: true,
    phoneNumberMasked,
  });
};
