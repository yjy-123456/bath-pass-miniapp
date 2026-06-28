# 用户手机号绑定与角色分离实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 基于已确认的中文设计，实现购买前强制手机号绑定、“我的”页换绑、用户/商家入口分离、订单和券手机号快照、商家手机号查询。

**架构：** 保持当前原生微信小程序 + 微信云开发结构。用户身份继续以 `openid` 为主，手机号只作为联系方式；所有关键校验放在云函数侧，前端只负责引导和展示。新增共享业务方法用于手机号脱敏、订单/券快照生成和测试。

**技术栈：** 微信小程序 WXML/WXSS/JS、微信云开发云函数、云数据库、Node.js 内置测试。

---

## 文件结构

### 新增文件

- `cloudfunctions/getProfile/index.js`：获取当前用户资料、手机号状态和店员身份。
- `cloudfunctions/bindPhoneNumber/index.js`：通过微信手机号授权 `code` 绑定或换绑手机号。
- `cloudfunctions/getMyOrders/index.js`：获取当前用户订单列表。
- `cloudfunctions/searchMerchantCoupons/index.js`：店员按手机号或状态查询订单/券。
- `cloudfunctions/setCurrentUserAsDemoStaff/index.js`：Demo 专用，将当前用户设为店员。
- `miniprogram/pages/me/index.js`：我的页逻辑。
- `miniprogram/pages/me/index.wxml`：我的页结构。
- `miniprogram/pages/me/index.wxss`：我的页样式。
- `miniprogram/pages/me/index.json`：我的页配置。
- `miniprogram/pages/orders/index.js`：我的订单页逻辑。
- `miniprogram/pages/orders/index.wxml`：我的订单页结构。
- `miniprogram/pages/orders/index.wxss`：我的订单页样式。
- `miniprogram/pages/orders/index.json`：我的订单页配置。
- `miniprogram/pages/staff/search/index.js`：商家查询页逻辑。
- `miniprogram/pages/staff/search/index.wxml`：商家查询页结构。
- `miniprogram/pages/staff/search/index.wxss`：商家查询页样式。
- `miniprogram/pages/staff/search/index.json`：商家查询页配置。

### 修改文件

- `shared/business.js`：增加手机号脱敏、手机号绑定判断、订单/券手机号快照辅助方法。
- `tests/business.test.js`：增加手机号脱敏和手机号快照测试。
- `miniprogram/app.json`：新增页面，tabBar 改为 `套餐 / 我的券 / 我的`。
- `miniprogram/app.js`：缓存 `user`、`hasPhone`、`isStaff`、`staff`。
- `miniprogram/pages/product/index.js`：购买前检查手机号，缺失时展示绑定面板。
- `miniprogram/pages/product/index.wxml`：增加手机号绑定面板和授权按钮。
- `miniprogram/pages/product/index.wxss`：增加绑定面板样式。
- `miniprogram/pages/staff/index/index.js`：移除初始化授权逻辑，增加商家查询入口。
- `miniprogram/pages/staff/index/index.wxml`：更新无权限文案，增加查询入口。
- `miniprogram/pages/staff/confirm/index.js`：展示券上的脱敏手机号。
- `miniprogram/pages/staff/confirm/index.wxml`：增加手机号行。
- `cloudfunctions/_shared/db.js`：增加 `getOrCreateUser`、`ensureCollections`、`maskPhone` 引用辅助。
- `cloudfunctions/_shared/package.js`：导出新增业务方法。
- `cloudfunctions/login/index.js`：返回完整用户资料和手机号状态。
- `cloudfunctions/seedDemoData/index.js`：不再自动将调用者加入 `staff`。
- `cloudfunctions/createOrder/index.js`：强制要求手机号，写入订单手机号快照。
- `cloudfunctions/mockPayOrder/index.js`：发券时复制手机号快照。
- `cloudfunctions/checkRedeemCode/index.js`：返回脱敏手机号上下文。
- `cloudfunctions/redeemCoupon/index.js`：核销日志记录脱敏手机号。
- `scripts/check-structure.js`：检查新增页面和云函数。
- `scripts/prepare-cloudfunctions.js`：同步新增云函数共享模块和依赖。
- `README.md`：更新手机号绑定、角色分离、双账号测试和云函数上传说明。

---

## Task 1: 共享业务规则和测试

**文件：**
- 修改：`shared/business.js`
- 修改：`tests/business.test.js`

- [ ] **Step 1: 写失败测试**

在 `tests/business.test.js` 增加测试：

```js
test('maskPhone hides middle digits and keeps invalid values empty', () => {
  const { maskPhone } = require('../shared/business');

  assert.equal(maskPhone('13812340000'), '138****0000');
  assert.equal(maskPhone(''), '');
  assert.equal(maskPhone(null), '');
});

test('createContactSnapshot stores full and masked phone', () => {
  const { createContactSnapshot } = require('../shared/business');

  assert.deepEqual(createContactSnapshot('13812340000'), {
    contactPhoneSnapshot: '13812340000',
    contactPhoneMaskedSnapshot: '138****0000',
  });
});

test('hasBoundPhone accepts only non-empty phone numbers', () => {
  const { hasBoundPhone } = require('../shared/business');

  assert.equal(hasBoundPhone({ phoneNumber: '13812340000' }), true);
  assert.equal(hasBoundPhone({ phoneNumber: '' }), false);
  assert.equal(hasBoundPhone(null), false);
});
```

- [ ] **Step 2: 运行测试确认失败**

运行：

```bash
node --test tests/business.test.js
```

预期：失败，提示 `maskPhone`、`createContactSnapshot` 或 `hasBoundPhone` 未定义。

- [ ] **Step 3: 实现业务方法**

在 `shared/business.js` 增加并导出：

```js
function maskPhone(phoneNumber) {
  const text = String(phoneNumber || '').trim();
  if (!text) return '';
  if (text.length < 7) return text;
  return `${text.slice(0, 3)}****${text.slice(-4)}`;
}

function createContactSnapshot(phoneNumber) {
  const phone = String(phoneNumber || '').trim();
  return {
    contactPhoneSnapshot: phone,
    contactPhoneMaskedSnapshot: maskPhone(phone),
  };
}

function hasBoundPhone(user) {
  return Boolean(user && String(user.phoneNumber || '').trim());
}
```

- [ ] **Step 4: 运行测试确认通过**

运行：

```bash
node --test tests/business.test.js
```

预期：所有业务测试通过。

---

## Task 2: 用户资料云函数

**文件：**
- 修改：`cloudfunctions/_shared/db.js`
- 修改：`cloudfunctions/_shared/package.js`
- 修改：`cloudfunctions/login/index.js`
- 新增：`cloudfunctions/getProfile/index.js`
- 新增：`cloudfunctions/bindPhoneNumber/index.js`
- 修改：`scripts/check-structure.js`

- [ ] **Step 1: 增加共享用户方法**

在 `cloudfunctions/_shared/db.js` 增加：

```js
async function getOrCreateUser(openid) {
  const now = new Date();
  const users = db.collection('users');
  const existing = await users.where({ openid }).limit(1).get();

  if (existing.data.length) {
    await users.doc(existing.data[0]._id).update({
      data: {
        lastLoginAt: now,
        updatedAt: now,
      },
    });
    return { ...existing.data[0], lastLoginAt: now, updatedAt: now };
  }

  const user = {
    openid,
    nickname: '微信用户',
    avatarUrl: '',
    role: 'user',
    phoneNumber: '',
    phoneNumberMasked: '',
    phoneBoundAt: null,
    phoneUpdatedAt: null,
    createdAt: now,
    lastLoginAt: now,
    updatedAt: now,
  };
  const result = await users.add({ data: user });
  return { _id: result._id, ...user };
}
```

并导出 `getOrCreateUser`。

- [ ] **Step 2: 更新 `login`**

将 `cloudfunctions/login/index.js` 改为：

```js
const { cloud, getActiveStaff, getOrCreateUser, ok } = require('./_shared/db');
const { hasBoundPhone } = require('./_shared/package');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const user = await getOrCreateUser(OPENID);
  const staff = await getActiveStaff(OPENID);

  return ok({
    openid: OPENID,
    user,
    hasPhone: hasBoundPhone(user),
    isStaff: Boolean(staff),
    staff,
  });
};
```

- [ ] **Step 3: 新增 `getProfile`**

创建 `cloudfunctions/getProfile/index.js`：

```js
const { cloud, getActiveStaff, getOrCreateUser, ok } = require('./_shared/db');
const { hasBoundPhone } = require('./_shared/package');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const user = await getOrCreateUser(OPENID);
  const staff = await getActiveStaff(OPENID);

  return ok({
    user,
    openid: OPENID,
    hasPhone: hasBoundPhone(user),
    isStaff: Boolean(staff),
    staff,
  });
};
```

- [ ] **Step 4: 新增 `bindPhoneNumber`**

创建 `cloudfunctions/bindPhoneNumber/index.js`：

```js
const { cloud, db, fail, findOne, getOrCreateUser, ok } = require('./_shared/db');
const { maskPhone } = require('./_shared/package');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { code } = event || {};
  if (!code) return fail('手机号授权已过期，请重新授权。', 'PHONE_CODE_REQUIRED');

  await getOrCreateUser(OPENID);

  let phoneInfo;
  try {
    phoneInfo = await cloud.openapi.phonenumber.getPhoneNumber({ code });
  } catch (error) {
    return fail('手机号绑定失败，请稍后重试。', 'PHONE_BIND_FAILED');
  }

  const phoneNumber = phoneInfo.phoneInfo && phoneInfo.phoneInfo.phoneNumber;
  if (!phoneNumber) return fail('手机号绑定失败，请稍后重试。', 'PHONE_EMPTY');

  const now = new Date();
  const phoneNumberMasked = maskPhone(phoneNumber);
  const existing = await findOne('users', { openid: OPENID });
  const firstBoundAt = existing && existing.phoneBoundAt ? existing.phoneBoundAt : now;

  await db.collection('users').doc(existing._id).update({
    data: {
      phoneNumber,
      phoneNumberMasked,
      phoneBoundAt: firstBoundAt,
      phoneUpdatedAt: now,
      updatedAt: now,
    },
  });

  return ok({
    hasPhone: true,
    phoneNumberMasked,
  });
};
```

- [ ] **Step 5: 更新结构检查**

在 `scripts/check-structure.js` 的 `requiredFiles` 中加入：

```js
'cloudfunctions/getProfile/index.js',
'cloudfunctions/bindPhoneNumber/index.js',
```

- [ ] **Step 6: 同步云函数共享模块并检查**

运行：

```bash
npm run prepare:cloud
node --check cloudfunctions/getProfile/index.js
node --check cloudfunctions/bindPhoneNumber/index.js
```

预期：无语法错误。

---

## Task 3: 我的页与导航

**文件：**
- 修改：`miniprogram/app.js`
- 修改：`miniprogram/app.json`
- 新增：`miniprogram/pages/me/index.js`
- 新增：`miniprogram/pages/me/index.wxml`
- 新增：`miniprogram/pages/me/index.wxss`
- 新增：`miniprogram/pages/me/index.json`
- 修改：`scripts/check-structure.js`

- [ ] **Step 1: 更新 app 全局状态**

在 `miniprogram/app.js` 的 `globalData` 增加：

```js
user: null,
hasPhone: false,
staff: null,
```

并新增方法：

```js
async refreshProfile() {
  const profile = await this.callFunction('getProfile');
  this.globalData.openid = profile.openid;
  this.globalData.user = profile.user;
  this.globalData.hasPhone = profile.hasPhone;
  this.globalData.isStaff = profile.isStaff;
  this.globalData.staff = profile.staff;
  return profile;
}
```

- [ ] **Step 2: 修改 tabBar 和页面路由**

在 `miniprogram/app.json`：

新增页面：

```json
"pages/me/index"
```

将 tabBar 第三项改为：

```json
{
  "pagePath": "pages/me/index",
  "text": "我的"
}
```

保留 `pages/staff/index/index` 等商家页面在 `pages` 中，但不作为 tabBar。

- [ ] **Step 3: 创建我的页 JS**

创建 `miniprogram/pages/me/index.js`：

```js
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
    if (!code) {
      wx.showToast({ title: errMsg && errMsg.includes('deny') ? '需要授权手机号后才能绑定' : '手机号授权已取消', icon: 'none' });
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

  callStore() {
    if (!this.data.storePhone) {
      wx.showToast({ title: '暂无门店电话', icon: 'none' });
      return;
    }
    wx.makePhoneCall({ phoneNumber: this.data.storePhone });
  },
});
```

- [ ] **Step 4: 创建我的页 WXML**

创建 `miniprogram/pages/me/index.wxml`：

```xml
<view class="page">
  <view class="card profile">
    <view class="title">我的</view>
    <view class="subtle">当前身份：{{identityText}}</view>
    <view class="phone-row">
      <view>
        <view class="label">手机号</view>
        <view class="phone">{{hasPhone ? phoneNumberMasked : '未绑定'}}</view>
      </view>
      <button class="mini-btn" open-type="getPhoneNumber" bindgetphonenumber="bindPhone">
        {{hasPhone ? '换绑' : '绑定'}}
      </button>
    </view>
  </view>

  <view class="card menu">
    <view class="menu-item" bindtap="goOrders">我的订单</view>
    <view class="menu-item" bindtap="goCoupons">我的券</view>
    <view class="menu-item" bindtap="callStore">联系商家</view>
    <view wx:if="{{isStaff}}" class="menu-item staff" bindtap="goStaff">商家工作台</view>
  </view>

  <view class="card debug">
    <view class="label">Demo 调试 openid</view>
    <view class="openid">{{openid}}</view>
  </view>
</view>
```

- [ ] **Step 5: 创建我的页样式和配置**

创建 `miniprogram/pages/me/index.json`：

```json
{
  "navigationBarTitleText": "我的"
}
```

创建 `miniprogram/pages/me/index.wxss`，使用项目现有 `.card`、`.title`、`.subtle` 风格，并为 `.mini-btn`、`.menu-item`、`.openid` 增加紧凑样式。

- [ ] **Step 6: 运行结构检查**

运行：

```bash
node scripts/check-structure.js
```

预期：新增页面结构检查通过。

---

## Task 4: 购买前强制绑定手机号

**文件：**
- 修改：`miniprogram/pages/product/index.js`
- 修改：`miniprogram/pages/product/index.wxml`
- 修改：`miniprogram/pages/product/index.wxss`
- 修改：`cloudfunctions/createOrder/index.js`
- 修改：`cloudfunctions/mockPayOrder/index.js`

- [ ] **Step 1: 云函数强制手机号**

在 `cloudfunctions/createOrder/index.js`：

1. 引入 `findOne` 和 `createContactSnapshot`。
2. 创建订单前查询 `users`。
3. 如果没有手机号，返回 `PHONE_REQUIRED`。
4. 在订单中写入手机号快照。

核心逻辑：

```js
const user = await findOne('users', { openid: OPENID });
if (!user || !user.phoneNumber) {
  return fail('购买前需绑定手机号', 'PHONE_REQUIRED');
}
const contactSnapshot = createContactSnapshot(user.phoneNumber);
```

订单对象增加：

```js
...contactSnapshot,
```

- [ ] **Step 2: 发券复制手机号快照**

在 `cloudfunctions/mockPayOrder/index.js` 中，`drafts` 生成后为每张券补充：

```js
contactPhoneSnapshot: order.contactPhoneSnapshot || '',
contactPhoneMaskedSnapshot: order.contactPhoneMaskedSnapshot || '',
```

- [ ] **Step 3: 前端购买前检查**

在 `miniprogram/pages/product/index.js` 的 `data` 增加：

```js
needPhone: false,
bindingPhone: false,
```

在 `buyNow()` 开头：

```js
const profile = await app.refreshProfile();
if (!profile.hasPhone) {
  this.setData({ needPhone: true });
  return;
}
```

新增 `bindPhoneAndBuy(event)`，授权成功后调用 `bindPhoneNumber`，再继续创建订单。

- [ ] **Step 4: 前端绑定面板**

在 `miniprogram/pages/product/index.wxml` 的购买卡片内增加：

```xml
<view wx:if="{{needPhone}}" class="phone-panel">
  <view class="section-title">绑定手机号</view>
  <view class="subtle">购买电子券需绑定手机号，便于门店核对订单和售后联系。</view>
  <button class="btn" open-type="getPhoneNumber" bindgetphonenumber="bindPhoneAndBuy">授权手机号并继续</button>
</view>
```

购买按钮在 `needPhone` 时可以隐藏或保留，推荐隐藏普通购买按钮，减少重复点击。

- [ ] **Step 5: 错误兜底**

如果 `createOrder` 返回 `PHONE_REQUIRED`，前端捕获后展示绑定面板：

```js
if (error.message && error.message.includes('手机号')) {
  this.setData({ needPhone: true });
}
```

- [ ] **Step 6: 检查语法**

运行：

```bash
node --check miniprogram/pages/product/index.js
node --check cloudfunctions/createOrder/index.js
node --check cloudfunctions/mockPayOrder/index.js
```

预期：无语法错误。

---

## Task 5: 我的订单页

**文件：**
- 新增：`cloudfunctions/getMyOrders/index.js`
- 新增：`miniprogram/pages/orders/index.js`
- 新增：`miniprogram/pages/orders/index.wxml`
- 新增：`miniprogram/pages/orders/index.wxss`
- 新增：`miniprogram/pages/orders/index.json`
- 修改：`miniprogram/app.json`
- 修改：`scripts/check-structure.js`

- [ ] **Step 1: 新增 `getMyOrders` 云函数**

创建 `cloudfunctions/getMyOrders/index.js`：

```js
const { cloud, db, ok } = require('./_shared/db');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const result = await db.collection('orders')
    .where({ openid: OPENID })
    .orderBy('createdAt', 'desc')
    .get();

  return ok({ orders: result.data });
};
```

- [ ] **Step 2: 增加页面路由和结构检查**

在 `miniprogram/app.json` 的 `pages` 加入：

```json
"pages/orders/index"
```

在 `scripts/check-structure.js` 的 `requiredFiles` 加入：

```js
'cloudfunctions/getMyOrders/index.js',
```

- [ ] **Step 3: 创建订单页 JS**

创建 `miniprogram/pages/orders/index.js`，调用 `getMyOrders`，把金额、状态和时间格式化后写入 `orders`。

- [ ] **Step 4: 创建订单页 WXML/WXSS/JSON**

页面展示：

- 套餐名。
- 数量。
- 总价。
- 状态：待支付、已支付、已关闭。
- 下单时间。
- 联系手机号脱敏快照。

- [ ] **Step 5: 运行结构检查**

运行：

```bash
node scripts/check-structure.js
```

预期：订单页结构检查通过。

---

## Task 6: 商家入口和 Demo 店员设置

**文件：**
- 新增：`cloudfunctions/setCurrentUserAsDemoStaff/index.js`
- 修改：`cloudfunctions/seedDemoData/index.js`
- 修改：`miniprogram/pages/staff/index/index.js`
- 修改：`miniprogram/pages/staff/index/index.wxml`
- 修改：`scripts/check-structure.js`

- [ ] **Step 1: 从 `seedDemoData` 移除自动授权店员**

删除 `seedDemoData` 中写入 `staff` 的逻辑，并调整返回信息：

```js
return ok({
  message: 'Demo 数据已初始化，请在我的页或数据库中设置店员账号。',
  productCount: demoProducts.length,
});
```

- [ ] **Step 2: 新增 Demo 店员云函数**

创建 `cloudfunctions/setCurrentUserAsDemoStaff/index.js`：

```js
const { cloud, db, ok } = require('./_shared/db');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const now = new Date();
  await db.collection('staff').doc(OPENID).set({
    data: {
      openid: OPENID,
      name: 'Demo 店员',
      role: 'admin',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  });

  return ok({
    staffOpenid: OPENID,
    message: '当前账号已设为 Demo 店员。',
  });
};
```

- [ ] **Step 3: 更新商家页无权限文案**

将商家页无权限提示改为：

```text
当前账号暂无店员权限。请让管理员在 staff 集合中添加你的 openid，或在 Demo 环境使用“设为 Demo 店员”。
```

保留一个 Demo 按钮调用 `setCurrentUserAsDemoStaff`，但文案要明确是 Demo 用途。

- [ ] **Step 4: 增加商家查询入口**

在商家工作台增加按钮：

```xml
<button class="btn secondary" bindtap="goSearch">订单/券查询</button>
```

JS 增加：

```js
goSearch() {
  wx.navigateTo({ url: '/pages/staff/search/index' });
}
```

- [ ] **Step 5: 更新结构检查并运行**

加入：

```js
'cloudfunctions/setCurrentUserAsDemoStaff/index.js',
```

运行：

```bash
npm run check
```

预期：通过。

---

## Task 7: 商家手机号查询和核销手机号上下文

**文件：**
- 新增：`cloudfunctions/searchMerchantCoupons/index.js`
- 修改：`cloudfunctions/checkRedeemCode/index.js`
- 修改：`cloudfunctions/redeemCoupon/index.js`
- 新增：`miniprogram/pages/staff/search/index.js`
- 新增：`miniprogram/pages/staff/search/index.wxml`
- 新增：`miniprogram/pages/staff/search/index.wxss`
- 新增：`miniprogram/pages/staff/search/index.json`
- 修改：`miniprogram/pages/staff/confirm/index.js`
- 修改：`miniprogram/pages/staff/confirm/index.wxml`
- 修改：`scripts/check-structure.js`

- [ ] **Step 1: 新增查询云函数**

创建 `cloudfunctions/searchMerchantCoupons/index.js`：

```js
const { _, cloud, db, fail, ok, requireStaff } = require('./_shared/db');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { phoneKeyword = '', status = '' } = event || {};

  try {
    await requireStaff(OPENID);
  } catch (error) {
    return fail(error.message, error.code);
  }

  const where = {};
  if (status) where.status = status;
  if (phoneKeyword) {
    where.contactPhoneSnapshot = db.RegExp({
      regexp: String(phoneKeyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      options: 'i',
    });
  }

  const result = await db.collection('coupons')
    .where(where)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  return ok({ coupons: result.data });
};
```

- [ ] **Step 2: 核销检查返回手机号上下文**

`checkRedeemCode` 的成功结果增加：

```js
contactPhoneMaskedSnapshot: coupon.contactPhoneMaskedSnapshot || '',
```

- [ ] **Step 3: 核销日志记录脱敏手机号**

`redeemCoupon` 的成功和失败日志中增加：

```js
contactPhoneMaskedSnapshot: coupon && coupon.contactPhoneMaskedSnapshot,
```

- [ ] **Step 4: 更新核销确认页**

`miniprogram/pages/staff/confirm/index.js` 设置：

```js
contactPhoneMasked: coupon.contactPhoneMaskedSnapshot || ''
```

`index.wxml` 增加一行：

```xml
<view class="info-row">
  <text class="subtle">用户手机号</text>
  <text>{{contactPhoneMasked || '-'}}</text>
</view>
```

- [ ] **Step 5: 创建商家查询页**

查询页包含：

- 手机号搜索输入框。
- 状态筛选按钮：全部、未使用、已使用、已过期。
- 查询结果列表。
- 列表显示套餐名、券状态、券号、手机号、有效期。

- [ ] **Step 6: 运行检查**

运行：

```bash
npm run check
node --check cloudfunctions/searchMerchantCoupons/index.js
node --check miniprogram/pages/staff/search/index.js
```

预期：通过。

---

## Task 8: 云函数依赖同步和 README 更新

**文件：**
- 修改：`scripts/prepare-cloudfunctions.js`
- 修改：`README.md`

- [ ] **Step 1: 确认准备脚本覆盖新增函数**

`scripts/prepare-cloudfunctions.js` 已按目录自动发现函数，不需要写死新增函数。运行后确认输出函数数量从 10 增加到 15。

运行：

```bash
npm run prepare:cloud
```

预期：输出 `Prepared shared modules for 15 cloud functions.`

- [ ] **Step 2: 更新 README**

README 增加：

- 新增云函数上传清单。
- 手机号绑定说明。
- “我的”页和商家入口说明。
- 双账号测试流程。
- 需要重新上传部署的云函数。
- 购买前授权手机号的预期行为。

- [ ] **Step 3: 运行最终检查**

运行：

```bash
npm run check
find miniprogram cloudfunctions shared scripts tests -name '*.js' -print0 | xargs -0 -n1 node --check
```

预期：全部通过。

---

## Task 9: 手工验收流程

**文件：**
- 不改文件。

- [ ] **Step 1: 上传云函数**

在微信开发者工具上传新增和修改过的云函数，选择“上传并部署：云端安装依赖”：

```text
getProfile
bindPhoneNumber
getMyOrders
searchMerchantCoupons
setCurrentUserAsDemoStaff
login
seedDemoData
createOrder
mockPayOrder
checkRedeemCode
redeemCoupon
```

- [ ] **Step 2: 用户账号 A 验收**

1. A 打开小程序。
2. A 进入套餐详情。
3. A 点击模拟购买。
4. A 看到手机号授权面板。
5. A 授权手机号。
6. A 完成模拟支付。
7. A 在“我的券”看到券。
8. A 在“我的”看到脱敏手机号。
9. A 在“我的订单”看到订单和手机号快照。

- [ ] **Step 3: 店员账号 B 验收**

1. B 打开小程序。
2. B 进入“我的”。
3. B 使用 Demo 按钮设为店员，或手动写入 `staff`。
4. B 看到“商家工作台”。
5. B 扫 A 的券二维码。
6. B 在核销确认页看到脱敏手机号。
7. B 确认核销。
8. B 在今日核销记录看到记录。
9. B 在订单/券查询页用 A 手机号后 4 位搜到券。

- [ ] **Step 4: 反向验收**

1. 未绑定手机号时不能绕过前端直接创建订单。
2. 非店员不能调用商家查询、核销云函数。
3. 已使用券再次核销提示已使用。
4. 动态码过期后提示动态码已过期。
5. 换绑手机号后，历史订单保留旧手机号快照。

---

## 完成标准

- `npm run check` 通过。
- 所有 JS 文件 `node --check` 通过。
- 新增 spec 和计划已经提交。
- 微信开发者工具中完整跑通用户 A 买券、店员 B 核销、店员按手机号查询。
- README 包含部署和测试步骤。
