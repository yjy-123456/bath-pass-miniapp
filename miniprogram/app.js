App({
  globalData: {
    envId: 'cloud1-d8gn5w1ole6a44089',
    openid: '',
    user: null,
    hasPhone: false,
    isStaff: false,
    staff: null,
    store: null,
  },

  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: this.globalData.envId || undefined,
        traceUser: true,
      });
    }
  },

  async callFunction(name, data = {}) {
    const result = await wx.cloud.callFunction({ name, data });
    if (result.result && result.result.ok === false) {
      throw new Error(result.result.message || '操作失败');
    }
    return result.result;
  },

  async refreshProfile() {
    const profile = await this.callFunction('getProfile');
    this.globalData.openid = profile.openid;
    this.globalData.user = profile.user;
    this.globalData.hasPhone = profile.hasPhone;
    this.globalData.isStaff = profile.isStaff;
    this.globalData.staff = profile.staff;
    return profile;
  },

  formatFen(fen) {
    const yuan = fen / 100;
    return `¥${yuan.toFixed(fen % 100 === 0 ? 0 : 2)}`;
  },
});
