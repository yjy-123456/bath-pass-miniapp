const app = getApp();

function formatDate(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

Page({
  data: {
    couponId: '',
    coupon: { productSnapshot: {} },
    validToText: '',
    qrPayload: '',
    qrImage: '',
    secondsLeft: 0,
    expiresAt: 0,
  },

  onLoad(options) {
    this.setData({ couponId: options.id || '' });
    this.loadCouponAndCode();
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },

  async loadCouponAndCode() {
    try {
      const list = await app.callFunction('getMyCoupons');
      const coupon = list.coupons.find((item) => item._id === this.data.couponId);
      if (!coupon) throw new Error('电子券不存在');
      this.setData({
        coupon,
        validToText: formatDate(coupon.validTo),
      });
      await this.refreshCode();
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  async refreshCode() {
    try {
      const result = await app.callFunction('generateRedeemCode', { couponId: this.data.couponId });
      const expiresAt = new Date(result.expiresAt).getTime();
      this.setData({
        qrPayload: result.qrPayload,
        qrImage: result.qrImage,
        expiresAt,
      });
      this.startTimer();
    } catch (error) {
      wx.showToast({ title: error.message || '生成失败', icon: 'none' });
    }
  },

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((this.data.expiresAt - Date.now()) / 1000));
      this.setData({ secondsLeft });
      if (secondsLeft === 0 && this.timer) clearInterval(this.timer);
    };
    tick();
    this.timer = setInterval(tick, 1000);
  },
});
