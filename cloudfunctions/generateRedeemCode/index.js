const { cloud, db, fail, getById, ok } = require('./_shared/db');
const { isCouponRedeemable, makeRedeemExpiry, makeRedeemToken, REDEEM_CODE_TTL_SECONDS } = require('./_shared/package');
const QRCode = require('qrcode');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { couponId } = event || {};
  if (!couponId) return fail('缺少电子券编号');

  const coupon = await getById('coupons', couponId);
  if (!coupon || coupon.openid !== OPENID) return fail('电子券不存在', 'COUPON_NOT_FOUND');

  const status = isCouponRedeemable(coupon);
  if (!status.ok) return fail(status.reason, 'COUPON_NOT_REDEEMABLE');

  const now = new Date();
  const token = makeRedeemToken(Math.random, now);
  const qrPayload = `BATHPASS:${token}`;
  const expiresAt = makeRedeemExpiry(now);
  const qrImage = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 360,
  });

  await db.collection('redeemCodes').add({
    data: {
      token,
      couponId,
      openid: OPENID,
      expiresAt,
      used: false,
      createdAt: now,
    },
  });

  return ok({
    token,
    qrPayload,
    qrImage,
    expiresAt,
    ttlSeconds: REDEEM_CODE_TTL_SECONDS,
  });
};
