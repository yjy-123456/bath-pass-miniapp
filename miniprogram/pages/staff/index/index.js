const app = getApp();

Page({
  data: {
    isStaff: false,
    token: '',
  },

  onShow() {
    this.loadPermission();
  },

  async loadPermission() {
    try {
      const result = await app.callFunction('login');
      this.setData({ isStaff: result.isStaff });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  async setDemoStaff() {
    try {
      await app.callFunction('setCurrentUserAsDemoStaff');
      wx.showToast({ title: '已授权', icon: 'success' });
      await this.loadPermission();
    } catch (error) {
      wx.showToast({ title: error.message || '授权失败', icon: 'none' });
    }
  },

  scanCode() {
    wx.scanCode({
      onlyFromCamera: false,
      success: (result) => {
        this.openConfirm(result.result);
      },
      fail: (error) => {
        const message = error.errMsg && error.errMsg.includes('cancel') ? '扫码取消' : '未识别到有效二维码';
        wx.showToast({ title: message, icon: 'none' });
      },
    });
  },

  onTokenInput(event) {
    this.setData({ token: event.detail.value });
  },

  checkToken() {
    this.openConfirm(this.data.token);
  },

  openConfirm(token) {
    if (!token) {
      wx.showToast({ title: '请输入核销码', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/staff/confirm/index?token=${encodeURIComponent(token)}` });
  },

  goRecords() {
    wx.navigateTo({ url: '/pages/staff/records/index' });
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/staff/search/index' });
  },
});
