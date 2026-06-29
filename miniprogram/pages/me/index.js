const app = getApp();

Page({
  data: {
    user: {},
    hasPhone: false,
    phoneNumberMasked: '',
    isStaff: false,
    staff: null,
    identityText: '普通用户',
    storePhone: '',
    openid: '',
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    try {
      const profile = await app.refreshProfile();
      const staff = profile.staff || null;
      this.setData({
        user: profile.user,
        hasPhone: profile.hasPhone,
        phoneNumberMasked: profile.user.phoneNumberMasked || '',
        isStaff: profile.isStaff,
        staff,
        identityText: staff ? (staff.role === 'admin' ? '管理员' : '店员') : '普通用户',
        openid: profile.openid,
      });
      const products = await app.callFunction('getProducts');
      this.setData({ storePhone: products.store && products.store.phone ? products.store.phone : '' });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  async bindPhone(event) {
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
      await app.callFunction('bindPhoneNumber', { code });
      wx.showToast({ title: '已绑定', icon: 'success' });
      await this.loadProfile();
    } catch (error) {
      wx.showToast({ title: error.message || '绑定失败', icon: 'none' });
    }
  },

  goCoupons() {
    wx.switchTab({ url: '/pages/coupons/index' });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/index' });
  },

  goStaff() {
    wx.navigateTo({ url: '/pages/staff/index/index' });
  },

  async setDemoStaff() {
    try {
      await app.callFunction('setCurrentUserAsDemoStaff');
      wx.showToast({ title: '已设为店员', icon: 'success' });
      await this.loadProfile();
    } catch (error) {
      wx.showToast({ title: error.message || '授权失败', icon: 'none' });
    }
  },

  callStore() {
    if (!this.data.storePhone) {
      wx.showToast({ title: '暂无门店电话', icon: 'none' });
      return;
    }
    wx.makePhoneCall({ phoneNumber: this.data.storePhone });
  },
});
