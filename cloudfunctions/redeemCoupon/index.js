const { cloud, db, fail, findOne, getById, ok, requireStaff } = require('./_shared/db');
const { isCouponRedeemable, isRedeemCodeActive, normalizeRedeemToken } = require('./_shared/package');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { token: rawToken } = event || {};
  let staff;

  try {
    staff = await requireStaff(OPENID);
  } catch (error) {
    return fail(error.message, error.code);
  }

  const token = normalizeRedeemToken(rawToken);
  if (!token) return fail('缺少核销码');

  const now = new Date();
  const code = await findOne('redeemCodes', { token });
  if (!code) return fail('核销码不存在', 'CODE_NOT_FOUND');
  if (!isRedeemCodeActive(code, now)) return fail('动态码已过期', 'CODE_EXPIRED');

  const coupon = await getById('coupons', code.couponId);
  const status = isCouponRedeemable(coupon, now);
  if (!status.ok) {
    await db.collection('redeemLogs').add({
      data: {
        token,
        couponId: code.couponId,
        couponNo: coupon && coupon.couponNo,
        productName: coupon && coupon.productSnapshot && coupon.productSnapshot.name,
        contactPhoneMaskedSnapshot: coupon && coupon.contactPhoneMaskedSnapshot,
        staffOpenid: OPENID,
        staffName: staff.name,
        status: 'failed',
        reason: status.reason,
        createdAt: now,
      },
    });
    return fail(status.reason, 'COUPON_NOT_REDEEMABLE');
  }

  await db.collection('coupons').doc(coupon._id).update({
    data: {
      status: 'used',
      usedAt: now,
      usedByStaffOpenid: OPENID,
      updatedAt: now,
    },
  });
  await db.collection('redeemCodes').doc(code._id).update({
    data: {
      used: true,
      usedAt: now,
    },
  });
  await db.collection('redeemLogs').add({
    data: {
      token,
      couponId: coupon._id,
      couponNo: coupon.couponNo,
      productName: coupon.productSnapshot.name,
      contactPhoneMaskedSnapshot: coupon.contactPhoneMaskedSnapshot || '',
      staffOpenid: OPENID,
      staffName: staff.name,
      status: 'success',
      reason: '',
      createdAt: now,
    },
  });

  return ok({
    couponId: coupon._id,
    couponNo: coupon.couponNo,
    productName: coupon.productSnapshot.name,
    message: '核销成功',
  });
};
