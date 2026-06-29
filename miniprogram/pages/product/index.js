const app = getApp();

Page({
  data: {
    productId: '',
    product: null,
    quantity: 1,
    totalText: '¥0',
    needPhone: false,
    bindingPhone: false,
  },

  onLoad(options) {
    this.setData({ productId: options.id || '' });
    this.loadProduct();
  },

  async loadProduct() {
    try {
      const result = await app.callFunction('getProducts');
      const product = result.products.find((item) => item._id === this.data.productId);
      if (!product) throw new Error('套餐不存在');
      const decorated = { ...product, priceText: app.formatFen(product.priceFen) };
      this.setData({ product: decorated }, this.updateTotal);
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  updateTotal() {
    const { product, quantity } = this.data;
    this.setData({ totalText: product ? app.formatFen(product.priceFen * quantity) : '¥0' });
  },

  decrease() {
    if (this.data.quantity <= 1) return;
    this.setData({ quantity: this.data.quantity - 1 }, this.updateTotal);
  },

  increase() {
    if (this.data.quantity >= 9) return;
    this.setData({ quantity: this.data.quantity + 1 }, this.updateTotal);
  },

  async buyNow() {
    try {
      const profile = await app.refreshProfile();
      if (!profile.hasPhone) {
        this.setData({ needPhone: true });
        return;
      }
      await this.createOrderAndPay();
    } catch (error) {
      wx.showToast({ title: error.message || '下单失败', icon: 'none' });
    }
  },

  async bindPhoneAndBuy(event) {
    const { code, errMsg } = event.detail || {};
    console.log('getPhoneNumber result:', event.detail);
    if (!code) {
      const denied = errMsg && errMsg.includes('deny');
      const canceled = errMsg && errMsg.includes('cancel');
      wx.showToast({
        title: denied || canceled ? '手机号授权已取消' : '未获取到手机号授权，请用真机或检查手机号能力配置',
        icon: 'none',
      });
      return;
    }

    try {
      this.setData({ bindingPhone: true });
      await app.callFunction('bindPhoneNumber', { code });
      this.setData({ needPhone: false, bindingPhone: false });
      await this.createOrderAndPay();
    } catch (error) {
      this.setData({ bindingPhone: false });
      wx.showToast({ title: error.message || '手机号绑定失败', icon: 'none' });
    }
  },

  async createOrderAndPay() {
    try {
      wx.showLoading({ title: '创建订单' });
      const orderResult = await app.callFunction('createOrder', {
        productId: this.data.productId,
        quantity: this.data.quantity,
      });
      wx.hideLoading();
      wx.navigateTo({ url: `/pages/pay-result/index?orderId=${orderResult.orderId}` });
    } catch (error) {
      wx.hideLoading();
      if (error.message && error.message.includes('手机号')) {
        this.setData({ needPhone: true });
        return;
      }
      wx.showToast({ title: error.message || '下单失败', icon: 'none' });
    }
  },
});
