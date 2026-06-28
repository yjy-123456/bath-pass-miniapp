const DAY_MS = 24 * 60 * 60 * 1000;
const REDEEM_CODE_TTL_SECONDS = 60;

function assertPositiveInteger(value, name) {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
}

function computeOrderTotal(product, quantity) {
  if (!product || !Number.isInteger(product.priceFen)) {
    throw new Error('product price is required');
  }
  assertPositiveInteger(quantity, 'quantity');
  return product.priceFen * quantity;
}

function couponCopiesForOrder(product, quantity) {
  assertPositiveInteger(quantity, 'quantity');
  const copies = product && Number.isInteger(product.couponCopies) ? product.couponCopies : 1;
  return copies * quantity;
}

function endOfValidityDay(fromDate, validityDays) {
  const end = new Date(fromDate.getTime() + validityDays * DAY_MS);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

function snapshotProduct(product) {
  return {
    productId: product._id,
    name: product.name,
    description: product.description,
    detail: product.detail,
    priceFen: product.priceFen,
    originalPriceFen: product.originalPriceFen,
    validityDays: product.validityDays,
    couponCopies: product.couponCopies || 1,
  };
}

function createCouponDrafts({ orderId, orderNo, openid, product, quantity, paidAt }) {
  assertPositiveInteger(quantity, 'quantity');
  const paidDate = paidAt instanceof Date ? paidAt : new Date(paidAt);
  const copies = couponCopiesForOrder(product, quantity);
  const validTo = endOfValidityDay(paidDate, product.validityDays || 30);
  const snapshot = snapshotProduct(product);

  return Array.from({ length: copies }, (_, index) => ({
    couponNo: `QY${orderNo.replace(/\D/g, '').slice(-12)}-${String(index + 1).padStart(2, '0')}`,
    openid,
    orderId,
    productId: product._id,
    productSnapshot: snapshot,
    status: 'unused',
    validFrom: paidDate,
    validTo,
    usedAt: null,
    usedByStaffOpenid: null,
    createdAt: paidDate,
    updatedAt: paidDate,
  }));
}

function isRedeemCodeActive(code, now = new Date()) {
  if (!code || code.used) return false;
  const expiresAt = code.expiresAt instanceof Date ? code.expiresAt : new Date(code.expiresAt);
  return expiresAt.getTime() > now.getTime();
}

function normalizeRedeemToken(raw) {
  const text = String(raw || '').trim();
  return text.startsWith('BATHPASS:') ? text.slice('BATHPASS:'.length).trim() : text;
}

function makeOrderNo(now = new Date(), random = Math.random) {
  const pad = (value) => String(value).padStart(2, '0');
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
  const suffix = Math.floor(random() * 10000).toString().padStart(4, '0');
  return `MOCK${datePart}${suffix}`;
}

function makeRedeemToken(random = Math.random, now = new Date()) {
  const entropy = Math.floor(random() * 1e12).toString(36).padStart(8, '0');
  return `rdm_${now.getTime().toString(36)}_${entropy}`;
}

function makeRedeemExpiry(now = new Date(), ttlSeconds = REDEEM_CODE_TTL_SECONDS) {
  return new Date(now.getTime() + ttlSeconds * 1000);
}

function formatFen(fen) {
  return `¥${(fen / 100).toFixed(fen % 100 === 0 ? 0 : 2)}`;
}

function maskPhone(phoneNumber) {
  const text = String(phoneNumber || '').trim();
  if (!text) return '';
  if (text.length < 7) return text;
  return `${text.slice(0, 3)}****${text.slice(-4)}`;
}

function createContactSnapshot(phoneNumber) {
  const phone = String(phoneNumber || '').trim();
  return {
    contactPhoneSnapshot: phone,
    contactPhoneMaskedSnapshot: maskPhone(phone),
  };
}

function hasBoundPhone(user) {
  return Boolean(user && String(user.phoneNumber || '').trim());
}

function isCouponRedeemable(coupon, now = new Date()) {
  if (!coupon) return { ok: false, reason: '券不存在' };
  if (coupon.status === 'used') return { ok: false, reason: '已使用' };
  if (coupon.status === 'refunded') return { ok: false, reason: '已退款' };
  if (coupon.status !== 'unused') return { ok: false, reason: '不可核销' };
  const validTo = coupon.validTo instanceof Date ? coupon.validTo : new Date(coupon.validTo);
  if (validTo.getTime() < now.getTime()) return { ok: false, reason: '已过期' };
  return { ok: true, reason: '可核销' };
}

module.exports = {
  REDEEM_CODE_TTL_SECONDS,
  computeOrderTotal,
  couponCopiesForOrder,
  createContactSnapshot,
  createCouponDrafts,
  endOfValidityDay,
  formatFen,
  hasBoundPhone,
  isCouponRedeemable,
  isRedeemCodeActive,
  makeOrderNo,
  makeRedeemExpiry,
  makeRedeemToken,
  maskPhone,
  normalizeRedeemToken,
  snapshotProduct,
};
