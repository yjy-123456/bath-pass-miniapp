const test = require('node:test');
const assert = require('node:assert/strict');

const {
  computeOrderTotal,
  couponCopiesForOrder,
  createCouponDrafts,
  isRedeemCodeActive,
  normalizeRedeemToken,
} = require('../shared/business');

const { demoProducts } = require('../shared/demoData');

test('computeOrderTotal uses server-side product price and quantity', () => {
  const product = demoProducts.find((item) => item._id === 'bath-scrub');

  const total = computeOrderTotal(product, 3);

  assert.equal(total, 17700);
});

test('couponCopiesForOrder generates two coupons for friend pass per quantity', () => {
  const product = demoProducts.find((item) => item._id === 'friend-duo');

  assert.equal(couponCopiesForOrder(product, 1), 2);
  assert.equal(couponCopiesForOrder(product, 2), 4);
});

test('createCouponDrafts sets a stable validity window and coupon numbers', () => {
  const product = demoProducts.find((item) => item._id === 'single-bath');
  const paidAt = new Date('2026-06-28T10:00:00.000Z');

  const coupons = createCouponDrafts({
    orderId: 'order_1',
    orderNo: 'MOCK202606280001',
    openid: 'user_openid',
    product,
    quantity: 2,
    paidAt,
  });

  assert.equal(coupons.length, 2);
  assert.equal(coupons[0].couponNo, 'QY202606280001-01');
  assert.equal(coupons[1].couponNo, 'QY202606280001-02');
  assert.equal(coupons[0].validTo.toISOString(), '2026-07-28T23:59:59.999Z');
  assert.equal(coupons[0].status, 'unused');
});

test('isRedeemCodeActive rejects used or expired codes', () => {
  const now = new Date('2026-06-28T10:00:00.000Z');

  assert.equal(
    isRedeemCodeActive({ used: false, expiresAt: new Date('2026-06-28T10:00:01.000Z') }, now),
    true,
  );
  assert.equal(
    isRedeemCodeActive({ used: false, expiresAt: new Date('2026-06-28T09:59:59.000Z') }, now),
    false,
  );
  assert.equal(
    isRedeemCodeActive({ used: true, expiresAt: new Date('2026-06-28T10:00:01.000Z') }, now),
    false,
  );
});

test('normalizeRedeemToken accepts QR payloads and plain tokens', () => {
  assert.equal(normalizeRedeemToken('BATHPASS:abc123'), 'abc123');
  assert.equal(normalizeRedeemToken('  abc123  '), 'abc123');
});

test('maskPhone hides middle digits and keeps invalid values empty', () => {
  const { maskPhone } = require('../shared/business');

  assert.equal(maskPhone('13812340000'), '138****0000');
  assert.equal(maskPhone(''), '');
  assert.equal(maskPhone(null), '');
});

test('createContactSnapshot stores full and masked phone', () => {
  const { createContactSnapshot } = require('../shared/business');

  assert.deepEqual(createContactSnapshot('13812340000'), {
    contactPhoneSnapshot: '13812340000',
    contactPhoneMaskedSnapshot: '138****0000',
  });
});

test('hasBoundPhone accepts only non-empty phone numbers', () => {
  const { hasBoundPhone } = require('../shared/business');

  assert.equal(hasBoundPhone({ phoneNumber: '13812340000' }), true);
  assert.equal(hasBoundPhone({ phoneNumber: '' }), false);
  assert.equal(hasBoundPhone(null), false);
});
