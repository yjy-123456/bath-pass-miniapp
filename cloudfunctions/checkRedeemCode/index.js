const { cloud, db, fail, findOne, getById, ok, requireStaff } = require('./_shared/db');
const { isCouponRedeemable, isRedeemCodeActive, normalizeRedeemToken } = require('./_shared/package');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { token: rawToken } = event || {};

  try {
    await requireStaff(OPENID);
  } catch (error) {
    return fail(error.message, error.code);
  }

  const token = normalizeRedeemToken(rawToken);
  if (!token) return fail('缺少核销码');

  const code = await findOne('redeemCodes', { token });
  if (!code) return fail('核销码不存在', 'CODE_NOT_FOUND');
  if (!isRedeemCodeActive(code)) return fail('动态码已过期', 'CODE_EXPIRED');

  const coupon = await getById('coupons', code.couponId);
  const status = isCouponRedeemable(coupon);
  if (!status.ok) return fail(status.reason, 'COUPON_NOT_REDEEMABLE', { coupon, codeId: code._id });

  return ok({
    codeId: code._id,
    token,
    coupon,
    canRedeem: true,
    message: '可核销',
  });
};
