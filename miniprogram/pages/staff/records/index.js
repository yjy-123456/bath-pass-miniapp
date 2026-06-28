const app = getApp();

function formatTime(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

Page({
  data: {
    successCount: 0,
    failedCount: 0,
    records: [],
  },

  onShow() {
    this.loadRecords();
  },

  async loadRecords() {
    try {
      const result = await app.callFunction('getTodayRedeems');
      this.setData({
        successCount: result.successCount,
        failedCount: result.failedCount,
        records: result.records.map((item) => ({
          ...item,
          timeText: formatTime(item.createdAt),
          statusText: item.status === 'success' ? '成功' : `失败：${item.reason || '-'}`,
        })),
      });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },
});
