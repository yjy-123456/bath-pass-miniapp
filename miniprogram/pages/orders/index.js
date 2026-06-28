const app = getApp();

function formatTime(value) {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function statusText(status) {
  const map = {
    pending: '待支付',
    paid: '已支付',
    closed: '已关闭',
    refunded: '已退款',
  };
  return map[status] || status || '-';
}

Page({
  data: {
    orders: [],
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    try {
      const result = await app.callFunction('getMyOrders');
      this.setData({
        orders: result.orders.map((order) => ({
          ...order,
          createdAtText: formatTime(order.createdAt),
          statusText: statusText(order.status),
          totalText: app.formatFen(order.totalFeeFen),
        })),
      });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },
});
