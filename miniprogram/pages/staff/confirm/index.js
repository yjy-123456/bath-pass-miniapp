const app = getApp();

function formatDate(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

Page({
  data: {
    token: '',
    coupon: { productSnapshot: {} },
    couponTail: '',
    validToText: '',
    contactPhoneMasked: '',
    error: '',
  },

  onLoad(options) {
    this.setData({ token: decodeURIComponent(options.token || '') });
    this.check();
  },

  async check() {
    try {
      wx.showLoading({ title: '查询中' });
      const result = await app.callFunction('checkRedeemCode', { token: this.data.token });
      wx.hideLoading();
      const coupon = result.coupon;
      this.setData({
        coupon,
        couponTail: String(coupon.couponNo || '').slice(-4),
        validToText: formatDate(coupon.validTo),
        contactPhoneMasked: coupon.contactPhoneMaskedSnapshot || result.contactPhoneMaskedSnapshot || '',
        error: '',
      });
    } catch (error) {
      wx.hideLoading();
      this.setData({ error: error.message || '核销码无效' });
    }
  },

  async redeem() {
    try {
      wx.showLoading({ title: '核销中' });
      const result = await app.callFunction('redeemCoupon', { token: this.data.token });
      wx.hideLoading();
      wx.showToast({ title: result.message, icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/staff/records/index' });
      }, 800);
    } catch (error) {
      wx.hideLoading();
      this.setData({ error: error.message || '核销失败' });
    }
  },

  back() {
    wx.navigateBack();
  },
});
