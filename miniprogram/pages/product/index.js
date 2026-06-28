const app = getApp();

Page({
  data: {
    productId: '',
    product: null,
    quantity: 1,
    totalText: '¥0',
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
      wx.showLoading({ title: '创建订单' });
      const orderResult = await app.callFunction('createOrder', {
        productId: this.data.productId,
        quantity: this.data.quantity,
      });
      wx.hideLoading();
      wx.navigateTo({ url: `/pages/pay-result/index?orderId=${orderResult.orderId}` });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: error.message || '下单失败', icon: 'none' });
    }
  },
});
