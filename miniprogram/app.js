App({
  globalData: {
    envId: 'cloud1-d8gn5w1ole6a44089',
    openid: '',
    isStaff: false,
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

  formatFen(fen) {
    const yuan = fen / 100;
    return `¥${yuan.toFixed(fen % 100 === 0 ? 0 : 2)}`;
  },
});
