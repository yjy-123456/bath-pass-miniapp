const app = getApp();

function formatDate(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

Page({
  data: {
    tab: 'unused',
    groups: {
      unused: [],
      used: [],
      expired: [],
    },
    currentCoupons: [],
  },

  onShow() {
    this.loadCoupons();
  },

  async loadCoupons() {
    try {
      const result = await app.callFunction('getMyCoupons');
      const groups = { unused: [], used: [], expired: [] };
      result.coupons.forEach((coupon) => {
        const status = coupon.status === 'expired' ? 'expired' : coupon.status;
        const item = {
          ...coupon,
          validToText: formatDate(coupon.validTo),
          statusText: status === 'unused' ? '未使用' : status === 'used' ? '已使用' : '已过期',
        };
        if (groups[status]) groups[status].push(item);
      });
      this.setData({ groups }, this.updateCurrent);
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  switchTab(event) {
    this.setData({ tab: event.currentTarget.dataset.tab }, this.updateCurrent);
  },

  updateCurrent() {
    this.setData({ currentCoupons: this.data.groups[this.data.tab] || [] });
  },

  showCode(event) {
    wx.navigateTo({ url: `/pages/coupon-code/index?id=${event.currentTarget.dataset.id}` });
  },
});
