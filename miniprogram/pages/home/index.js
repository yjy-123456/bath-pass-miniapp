const app = getApp();

Page({
  data: {
    products: [],
    store: {},
    showSeedButton: false,
  },

  onLoad() {
    this.bootstrap();
  },

  async bootstrap() {
    try {
      await app.callFunction('login');
      await this.loadProducts();
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  async loadProducts() {
    const result = await app.callFunction('getProducts');
    if (!result.products.length) {
      await app.callFunction('seedDemoData');
      const seeded = await app.callFunction('getProducts');
      this.setData({
        products: this.decorateProducts(seeded.products),
        store: seeded.store || {},
        showSeedButton: !seeded.products.length,
      });
      return;
    }
    this.setData({
      products: this.decorateProducts(result.products),
      store: result.store || {},
      showSeedButton: false,
    });
  },

  decorateProducts(products) {
    return products.map((product) => ({
      ...product,
      priceText: app.formatFen(product.priceFen),
    }));
  },

  async seedDemo() {
    try {
      const result = await app.callFunction('seedDemoData');
      wx.showToast({ title: '已初始化', icon: 'success' });
      await this.loadProducts();
      console.log(result.message);
    } catch (error) {
      wx.showToast({ title: error.message || '初始化失败', icon: 'none' });
    }
  },

  goProduct(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/product/index?id=${id}` });
  },
});
