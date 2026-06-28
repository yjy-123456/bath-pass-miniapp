const app = getApp();

Page({
  data: {
    orderId: '',
    paid: false,
    message: 'Demo 阶段不接真实微信支付，点击后直接模拟支付成功并自动发券。',
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId || '' });
  },

  async mockPay() {
    try {
      wx.showLoading({ title: '模拟支付' });
      const result = await app.callFunction('mockPayOrder', { orderId: this.data.orderId });
      wx.hideLoading();
      this.setData({
        paid: true,
        message: `${result.message} 共发放 ${result.couponCount} 张电子券。`,
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '支付失败', icon: 'none' });
    }
  },

  goCoupons() {
    wx.switchTab({ url: '/pages/coupons/index' });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  },
});
