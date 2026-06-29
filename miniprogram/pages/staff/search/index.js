const app = getApp();

function formatDate(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function statusText(status) {
  const map = {
    unused: '未使用',
    used: '已使用',
    expired: '已过期',
    refunded: '已退款',
    void: '作废',
  };
  return map[status] || status || '-';
}

Page({
  data: {
    phoneKeyword: '',
    status: '',
    coupons: [],
  },

  onLoad() {
    this.search();
  },

  onKeywordInput(event) {
    this.setData({ phoneKeyword: event.detail.value });
  },

  switchStatus(event) {
    this.setData({ status: event.currentTarget.dataset.status }, this.search);
  },

  async search() {
    try {
      const result = await app.callFunction('searchMerchantCoupons', {
        phoneKeyword: this.data.phoneKeyword,
        status: this.data.status,
      });
      this.setData({
        coupons: result.coupons.map((coupon) => ({
          ...coupon,
          validToText: formatDate(coupon.validTo),
          statusText: statusText(coupon.status),
        })),
      });
    } catch (error) {
      wx.showToast({ title: error.message || '查询失败', icon: 'none' });
    }
  },
});
