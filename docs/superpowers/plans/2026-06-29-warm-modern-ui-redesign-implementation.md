# Warm Modern UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the WeChat mini program UI with the approved warm modern style, local icons, unified layouts, and subtle CSS animations while preserving all business behavior.

**Architecture:** Keep the existing mini program page structure and JavaScript behavior. Add local SVG icon source/page assets, generate PNG runtime assets for native tab bar icons, wire tab bar PNG icons in `app.json`, build a shared visual system in `app.wxss`, then update WXML/WXSS page surfaces in small groups. Verification relies on static checks, event binding preservation, asset existence, and the existing `npm run check` command.

**Tech Stack:** WeChat Mini Program WXML/WXSS/JSON, local SVG source/page assets, PNG tab bar runtime assets, Node.js test/check scripts.

---

## File Structure

- Create `miniprogram/assets/icons/`: local SVG line icons for source/page menu/action UI, plus generated PNG runtime icons for the native tab bar.
- Modify `miniprogram/app.json`: add tab bar icon paths and align window colors with the warm modern visual system.
- Modify `miniprogram/app.wxss`: shared page, typography, card, button, input, badge, empty state, icon, and animation styles.
- Modify user WXML/WXSS:
  - `miniprogram/pages/home/index.wxml`
  - `miniprogram/pages/home/index.wxss`
  - `miniprogram/pages/product/index.wxml`
  - `miniprogram/pages/product/index.wxss`
  - `miniprogram/pages/coupons/index.wxml`
  - `miniprogram/pages/coupons/index.wxss`
  - `miniprogram/pages/coupon-code/index.wxml`
  - `miniprogram/pages/coupon-code/index.wxss`
  - `miniprogram/pages/pay-result/index.wxml`
  - `miniprogram/pages/pay-result/index.wxss`
  - `miniprogram/pages/me/index.wxml`
  - `miniprogram/pages/me/index.wxss`
  - `miniprogram/pages/orders/index.wxml`
  - `miniprogram/pages/orders/index.wxss`
- Modify staff WXML/WXSS:
  - `miniprogram/pages/staff/index/index.wxml`
  - `miniprogram/pages/staff/index/index.wxss`
  - `miniprogram/pages/staff/confirm/index.wxml`
  - `miniprogram/pages/staff/confirm/index.wxss`
  - `miniprogram/pages/staff/records/index.wxml`
  - `miniprogram/pages/staff/records/index.wxss`
  - `miniprogram/pages/staff/search/index.wxml`
  - `miniprogram/pages/staff/search/index.wxss`

## Task 1: Add Local Icons And Tab Bar Wiring

**Files:**
- Create: `miniprogram/assets/icons/package.svg`
- Create: `miniprogram/assets/icons/package-active.svg`
- Create: `miniprogram/assets/icons/coupon.svg`
- Create: `miniprogram/assets/icons/coupon-active.svg`
- Create: `miniprogram/assets/icons/profile.svg`
- Create: `miniprogram/assets/icons/profile-active.svg`
- Create: `miniprogram/assets/icons/package.png`
- Create: `miniprogram/assets/icons/package-active.png`
- Create: `miniprogram/assets/icons/coupon.png`
- Create: `miniprogram/assets/icons/coupon-active.png`
- Create: `miniprogram/assets/icons/profile.png`
- Create: `miniprogram/assets/icons/profile-active.png`
- Create: `miniprogram/assets/icons/order.svg`
- Create: `miniprogram/assets/icons/phone.svg`
- Create: `miniprogram/assets/icons/contact.svg`
- Create: `miniprogram/assets/icons/staff.svg`
- Create: `miniprogram/assets/icons/scan.svg`
- Create: `miniprogram/assets/icons/records.svg`
- Create: `miniprogram/assets/icons/search.svg`
- Create: `miniprogram/assets/icons/check.svg`
- Create: `miniprogram/assets/icons/alert.svg`
- Create: `miniprogram/assets/icons/chevron.svg`
- Modify: `miniprogram/app.json`
- Modify: `docs/superpowers/plans/2026-06-29-warm-modern-ui-redesign-implementation.md`

- [ ] **Step 1: Create icon directory**

Run:

```bash
mkdir -p miniprogram/assets/icons
```

Expected: directory exists at `miniprogram/assets/icons`.

- [ ] **Step 2: Add SVG icons**

Create each icon as a compact SVG using rounded line strokes. Use these color rules:

```text
Default tab icons: #7b8794
Active tab icons: #2f6f73
Page action icons: #2f6f73 or #7b8794
Alert icon: #b87333
Check icon: #16805f
Chevron icon: #94a3b8
```

Use this exact template style for every SVG:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
  <path d="M18 18h28v28H18z" stroke="#7b8794" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Replace the path geometry per icon, keep `width="64"`, `height="64"`, `viewBox="0 0 64 64"`, `fill="none"`, `stroke-width="4"`, `stroke-linecap="round"`, and `stroke-linejoin="round"`.

- [ ] **Step 3: Generate PNG tab bar runtime icons**

Generate 81x81 PNG files from the six tab SVGs so native WeChat tab bar runtime assets do not depend on SVG compatibility:

```bash
tmpdir=$(mktemp -d)
for name in package package-active coupon coupon-active profile profile-active; do
  qlmanage -t -s 81 -o "$tmpdir" "miniprogram/assets/icons/$name.svg"
  mv "$tmpdir/$name.svg.png" "miniprogram/assets/icons/$name.png"
done
rm -rf "$tmpdir"
```

Expected: these files exist and are 81x81 PNG images:

```text
miniprogram/assets/icons/package.png
miniprogram/assets/icons/package-active.png
miniprogram/assets/icons/coupon.png
miniprogram/assets/icons/coupon-active.png
miniprogram/assets/icons/profile.png
miniprogram/assets/icons/profile-active.png
```

- [ ] **Step 4: Wire tab bar icons**

Update `miniprogram/app.json` tab bar entries to include `iconPath` and `selectedIconPath`:

```json
{
  "pagePath": "pages/home/index",
  "text": "套餐",
  "iconPath": "assets/icons/package.png",
  "selectedIconPath": "assets/icons/package-active.png"
}
```

```json
{
  "pagePath": "pages/coupons/index",
  "text": "我的券",
  "iconPath": "assets/icons/coupon.png",
  "selectedIconPath": "assets/icons/coupon-active.png"
}
```

```json
{
  "pagePath": "pages/me/index",
  "text": "我的",
  "iconPath": "assets/icons/profile.png",
  "selectedIconPath": "assets/icons/profile-active.png"
}
```

Also set:

```json
"navigationBarBackgroundColor": "#f7f2ea",
"backgroundColor": "#f7f2ea",
"selectedColor": "#2f6f73"
```

- [ ] **Step 5: Verify icon files and JSON**

Run:

```bash
node -e "const fs=require('fs'); const app=JSON.parse(fs.readFileSync('miniprogram/app.json','utf8')); for (const item of app.tabBar.list) { for (const key of ['iconPath','selectedIconPath']) { const asset=item[key]; if (!asset.endsWith('.png')) throw new Error('Expected png '+asset); if (!fs.existsSync('miniprogram/'+asset)) throw new Error('Missing '+asset); } } console.log('tab png icons ok')"
```

Expected output includes:

```text
tab png icons ok
```

- [ ] **Step 6: Commit**

Run:

```bash
git add miniprogram/app.json miniprogram/assets/icons docs/superpowers/plans/2026-06-29-warm-modern-ui-redesign-implementation.md
git commit -m "style: use png tab bar runtime icons"
```

Expected: commit succeeds with only app JSON, icon assets, and this plan update.

## Task 2: Build Shared Warm Modern Style System

**Files:**
- Modify: `miniprogram/app.wxss`

- [ ] **Step 1: Replace global style foundations**

Update `miniprogram/app.wxss` with shared tokens and base classes. Preserve the existing class names `.page`, `.hero`, `.notice`, `.card`, `.stack`, `.row`, `.title`, `.subtle`, `.price`, `.btn`, `.badge`, `.danger`, and `.empty` so current pages keep rendering during incremental work.

Include these foundations:

```css
page {
  min-height: 100%;
  color: #1f2933;
  background:
    linear-gradient(180deg, rgba(255, 247, 237, 0.72) 0%, rgba(247, 242, 234, 0) 420rpx),
    #f7f2ea;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

view,
text,
button,
input,
image {
  box-sizing: border-box;
}

button {
  margin: 0;
  padding: 0;
  line-height: 1;
}

button::after {
  border: 0;
}

.page {
  min-height: 100vh;
  padding: 24rpx 24rpx 56rpx;
}

.stack {
  display: grid;
  gap: 20rpx;
}

.card {
  padding: 28rpx;
  border: 1rpx solid rgba(31, 41, 51, 0.08);
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14rpx 36rpx rgba(45, 55, 72, 0.08);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.title {
  color: #17212b;
  font-size: 34rpx;
  font-weight: 850;
  letter-spacing: 0;
}

.section-title {
  color: #17212b;
  font-size: 29rpx;
  font-weight: 850;
}

.subtle {
  color: #6b7280;
  font-size: 24rpx;
  line-height: 1.6;
}

.price {
  color: #b87333;
  font-size: 42rpx;
  font-weight: 850;
  white-space: nowrap;
}
```

- [ ] **Step 2: Add shared controls, icons, empty states, and animations**

Append shared utility classes:

```css
.btn {
  width: 100%;
  height: 86rpx;
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #2f6f73, #25635f);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  box-shadow: 0 12rpx 22rpx rgba(47, 111, 115, 0.18);
}

.btn.secondary {
  border: 1rpx solid rgba(47, 111, 115, 0.22);
  background: #ffffff;
  color: #2f6f73;
  box-shadow: none;
}

.btn.warn {
  background: linear-gradient(135deg, #b87333, #9a5b24);
  box-shadow: 0 12rpx 22rpx rgba(184, 115, 51, 0.18);
}

.btn-hover {
  transform: scale(0.985);
  opacity: 0.92;
}

.icon {
  width: 38rpx;
  height: 38rpx;
  flex: 0 0 auto;
}

.badge {
  min-height: 44rpx;
  padding: 8rpx 16rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: #e6f3ef;
  color: #25635f;
  font-size: 23rpx;
  font-weight: 800;
  white-space: nowrap;
}

.notice {
  margin: 22rpx 0;
  padding: 20rpx 22rpx;
  border: 1rpx solid rgba(184, 115, 51, 0.18);
  border-radius: 16rpx;
  background: #fff7ed;
  color: #8a4b1f;
  font-size: 24rpx;
  line-height: 1.6;
}

.input,
.phone-input {
  height: 78rpx;
  padding: 0 22rpx;
  border: 1rpx solid rgba(31, 41, 51, 0.1);
  border-radius: 14rpx;
  background: #fbfaf8;
  color: #17212b;
  font-size: 26rpx;
}

.empty {
  padding: 92rpx 28rpx;
  color: #6b7280;
  text-align: center;
  font-size: 26rpx;
}

.empty-icon {
  width: 88rpx;
  height: 88rpx;
  margin: 0 auto 20rpx;
  opacity: 0.72;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(18rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes successPop {
  0% {
    transform: scale(0.82);
    opacity: 0;
  }
  70% {
    transform: scale(1.06);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

.fade-up {
  animation: fadeUp 320ms ease-out both;
}

.success-pop {
  animation: successPop 360ms ease-out both;
}
```

- [ ] **Step 3: Run static grep for preserved shared classes**

Run:

```bash
for c in page card btn badge empty notice price title subtle row stack; do rg "\\.${c}\\b" miniprogram/app.wxss >/dev/null || exit 1; done; echo "shared classes ok"
```

Expected output:

```text
shared classes ok
```

- [ ] **Step 4: Commit**

Run:

```bash
git add miniprogram/app.wxss
git commit -m "style: define warm modern miniapp system"
```

Expected: commit succeeds with only `miniprogram/app.wxss`.

## Task 3: Redesign User Purchase And Account Pages

**Files:**
- Modify: `miniprogram/pages/home/index.wxml`
- Modify: `miniprogram/pages/home/index.wxss`
- Modify: `miniprogram/pages/product/index.wxml`
- Modify: `miniprogram/pages/product/index.wxss`
- Modify: `miniprogram/pages/me/index.wxml`
- Modify: `miniprogram/pages/me/index.wxss`
- Modify: `miniprogram/pages/orders/index.wxml`
- Modify: `miniprogram/pages/orders/index.wxss`

- [ ] **Step 1: Update home WXML without changing bindings**

Keep `{{store.name}}`, `{{store.hours}}`, `{{store.notice}}`, `wx:for="{{products}}"`, `data-id="{{item._id}}"`, `bindtap="goProduct"`, `wx:if="{{showSeedButton}}"`, and `bindtap="seedDemo"`.

The redesigned structure should use:

```xml
<view class="page home-page">
  <view class="store-hero fade-up">
    <view class="hero-glow"></view>
    <view class="hero-kicker">本地澡堂电子券</view>
    <view class="hero-title">{{store.name || '清泉浴池'}}</view>
    <view class="hero-subtitle">营业中 {{store.hours || '10:00-23:30'}} · 到店出示电子券</view>
    <view class="hero-tags">
      <text>即买即用</text>
      <text>动态码核销</text>
    </view>
  </view>

  <view class="notice">{{store.notice || 'Demo 阶段使用模拟支付，不产生真实收款。'}}</view>

  <view class="section-head">
    <view>
      <view class="section-title">精选套餐</view>
      <view class="subtle">选择适合的洗浴电子券，到店扫码核销</view>
    </view>
  </view>

  <view class="stack">
    <view class="card product-card fade-up" wx:for="{{products}}" wx:key="_id">
      <view class="row product-main">
        <view class="product-copy">
          <view class="title">{{item.name}}</view>
          <view class="subtle">{{item.description}}</view>
        </view>
        <view class="price">{{item.priceText}}</view>
      </view>
      <view class="product-meta">
        <text>电子券</text>
        <text>到店核销</text>
      </view>
      <button class="btn secondary" hover-class="btn-hover" data-id="{{item._id}}" bindtap="goProduct">查看详情</button>
    </view>
  </view>

  <button wx:if="{{showSeedButton}}" class="btn secondary seed" hover-class="btn-hover" bindtap="seedDemo">初始化 Demo 数据</button>
</view>
```

- [ ] **Step 2: Update home WXSS**

Add page-specific classes for `.store-hero`, `.hero-tags`, `.section-head`, `.product-card`, `.product-meta`, and `.seed`. Use warm gradients and stable card spacing:

```css
.store-hero {
  position: relative;
  overflow: hidden;
  min-height: 288rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 22rpx;
  color: #ffffff;
  background:
    linear-gradient(145deg, rgba(29, 78, 74, 0.94), rgba(40, 85, 82, 0.78) 52%, rgba(184, 115, 51, 0.82)),
    radial-gradient(circle at 78% 18%, rgba(255, 255, 255, 0.2), transparent 28%);
  box-shadow: 0 18rpx 38rpx rgba(47, 111, 115, 0.18);
}
```

Also add these remaining rules:

```css
.hero-glow {
  position: absolute;
  width: 220rpx;
  height: 220rpx;
  right: -48rpx;
  top: -44rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}

.hero-kicker {
  position: relative;
  font-size: 23rpx;
  opacity: 0.86;
}

.hero-title {
  position: relative;
  margin-top: 12rpx;
  font-size: 46rpx;
  font-weight: 900;
}

.hero-subtitle {
  position: relative;
  margin-top: 10rpx;
  font-size: 24rpx;
  opacity: 0.9;
}

.hero-tags {
  position: relative;
  margin-top: 20rpx;
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.hero-tags text,
.product-meta text {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  font-size: 22rpx;
}

.section-head {
  margin: 28rpx 2rpx 18rpx;
}

.product-card {
  overflow: hidden;
}

.product-main {
  align-items: flex-start;
}

.product-copy {
  min-width: 0;
}

.product-meta {
  margin-top: 18rpx;
  display: flex;
  gap: 12rpx;
  color: #25635f;
}

.product-meta text {
  background: #e6f3ef;
}

.seed {
  margin-top: 28rpx;
}
```

- [ ] **Step 3: Update product WXML without changing handlers**

Keep `wx:if="{{product}}"`, `product.*` bindings, `quantity`, `totalText`, `needPhone`, `open-type="getPhoneNumber"`, `bindgetphonenumber="bindPhoneAndBuy"`, `bindtap="bindDemoPhoneAndBuy"`, `bindtap="buyNow"`, `bindtap="decrease"`, and `bindtap="increase"`.

Add icon-assisted list rows using `image` tags:

```xml
<image class="icon" src="/assets/icons/check.svg" mode="aspectFit"></image>
```

Use `hover-class="btn-hover"` on all tappable buttons.

- [ ] **Step 4: Update product WXSS**

Keep existing classes `.section`, `.section-title`, `.detail`, `.line`, `.stepper`, `.total`, `.phone-panel`, `.demo-phone`, `.demo-bind-row`, `.phone-input`, and `.mini-btn`; restyle them to match the shared system. Make stepper buttons exactly `64rpx` square and the demo row grid `1fr 132rpx`.

- [ ] **Step 5: Update profile WXML with icons**

Keep all bindings and handlers: `identityText`, `hasPhone`, `phoneNumberMasked`, `open-type="getPhoneNumber"`, `bindgetphonenumber="bindPhone"`, `demoPhoneNumber`, `bindinput="onDemoPhoneInput"`, `bindtap="bindDemoPhone"`, `goOrders`, `goCoupons`, `callStore`, `wx:if="{{isStaff}}"`, `goStaff`, `openid`, and `setDemoStaff`.

Each menu row should contain:

```xml
<image class="menu-icon" src="/assets/icons/order.svg" mode="aspectFit"></image>
<text>我的订单</text>
<image class="chevron" src="/assets/icons/chevron.svg" mode="aspectFit"></image>
```

- [ ] **Step 6: Update profile WXSS**

Create a warm profile card, phone status row, compact demo binding area, icon menu rows with stable `92rpx` height, and a visually quiet debug card. Ensure `.menu-item` remains a tap target and `.staff` uses teal emphasis.

- [ ] **Step 7: Update orders WXML/WXSS**

Keep `wx:if="{{orders.length}}"`, `wx:for="{{orders}}"`, `item.*` bindings, and the empty branch. Convert `.meta` to a two-column metadata grid where labels and values are visually distinct. Empty state should include:

```xml
<image class="empty-icon" src="/assets/icons/order.svg" mode="aspectFit"></image>
<view>暂无订单</view>
```

- [ ] **Step 8: Verify user page event handlers remain**

Run:

```bash
for p in home product me orders; do echo "checking $p"; rg "bindtap|bindgetphonenumber|bindinput|open-type" miniprogram/pages/$p/index.wxml; done
```

Expected: output includes `goProduct`, `seedDemo`, `decrease`, `increase`, `bindPhoneAndBuy`, `bindDemoPhoneAndBuy`, `buyNow`, `bindPhone`, `bindDemoPhone`, `goOrders`, `goCoupons`, `callStore`, `goStaff`, and `setDemoStaff`.

- [ ] **Step 9: Commit**

Run:

```bash
git add miniprogram/pages/home miniprogram/pages/product miniprogram/pages/me miniprogram/pages/orders
git commit -m "style: redesign purchase and account pages"
```

Expected: commit succeeds with only the listed user page files.

## Task 4: Redesign Coupon, QR, And Payment Result Pages

**Files:**
- Modify: `miniprogram/pages/coupons/index.wxml`
- Modify: `miniprogram/pages/coupons/index.wxss`
- Modify: `miniprogram/pages/coupon-code/index.wxml`
- Modify: `miniprogram/pages/coupon-code/index.wxss`
- Modify: `miniprogram/pages/pay-result/index.wxml`
- Modify: `miniprogram/pages/pay-result/index.wxss`

- [ ] **Step 1: Redesign coupons WXML**

Keep `tab`, `groups.*.length`, `data-tab`, `bindtap="switchTab"`, `currentCoupons`, `wx:for`, `item.*`, `wx:if="{{item.status === 'unused'}}"`, `data-id="{{item._id}}"`, and `bindtap="showCode"`.

Use segmented tab labels with counts:

```xml
<view class="tab-label">未使用</view>
<view class="tab-count">{{groups.unused.length}}</view>
```

Empty branch should use `/assets/icons/coupon.svg`.

- [ ] **Step 2: Redesign coupons WXSS**

Style `.tabs` as a soft segmented control, `.coupon` as a voucher card, and `.coupon .btn` as a clear secondary action. Keep three equal columns and avoid text overflow by using smaller count text.

- [ ] **Step 3: Redesign coupon code WXML**

Keep `coupon.*`, `validToText`, `qrImage`, `show-menu-by-longpress="true"`, `qrPayload`, `secondsLeft`, and `bindtap="refreshCode"`.

Add a QR frame wrapper:

```xml
<view class="qr-frame">
  <image class="qr-image" src="{{qrImage}}" mode="aspectFit" show-menu-by-longpress="true"></image>
</view>
```

- [ ] **Step 4: Redesign coupon code WXSS**

Style `.code-card` as a ticket-like card, `.qr-frame` as a clean white scanning area, `.token` as a monospace-like payload block, and `.timer` as a copper accent pill. Keep QR image dimensions stable at `420rpx`.

- [ ] **Step 5: Redesign pay result WXML/WXSS**

Keep `paid`, `message`, `bindtap="mockPay"`, `bindtap="goCoupons"`, and `bindtap="goHome"`. Use `/assets/icons/check.svg` for paid state where possible, and retain a text fallback for unpaid state. Add `success-pop` to the status icon wrapper when paid.

- [ ] **Step 6: Verify coupon/payment handlers remain**

Run:

```bash
for p in coupons coupon-code pay-result; do echo "checking $p"; rg "bindtap|show-menu-by-longpress" miniprogram/pages/$p/index.wxml; done
```

Expected: output includes `switchTab`, `showCode`, `refreshCode`, `mockPay`, `goCoupons`, and `goHome`.

- [ ] **Step 7: Commit**

Run:

```bash
git add miniprogram/pages/coupons miniprogram/pages/coupon-code miniprogram/pages/pay-result
git commit -m "style: redesign coupon and payment screens"
```

Expected: commit succeeds with only the listed page files.

## Task 5: Redesign Staff Workbench And Operations Pages

**Files:**
- Modify: `miniprogram/pages/staff/index/index.wxml`
- Modify: `miniprogram/pages/staff/index/index.wxss`
- Modify: `miniprogram/pages/staff/confirm/index.wxml`
- Modify: `miniprogram/pages/staff/confirm/index.wxss`
- Modify: `miniprogram/pages/staff/records/index.wxml`
- Modify: `miniprogram/pages/staff/records/index.wxss`
- Modify: `miniprogram/pages/staff/search/index.wxml`
- Modify: `miniprogram/pages/staff/search/index.wxss`

- [ ] **Step 1: Redesign staff workbench WXML**

Keep `wx:if="{{!isStaff}}"`, `bindtap="setDemoStaff"`, `scanCode`, `token`, `bindinput="onTokenInput"`, `bindtap="checkToken"`, `bindtap="goRecords"`, and `bindtap="goSearch"`.

For staff state, make scan primary:

```xml
<view class="scan-box fade-up" bindtap="scanCode">
  <view class="scan-corners">
    <view class="scan-mark">
      <image class="scan-icon" src="/assets/icons/scan.svg" mode="aspectFit"></image>
    </view>
  </view>
  <view class="scan-title">扫用户电子券二维码</view>
  <view class="scan-subtitle">支持 BATHPASS 动态码核销</view>
  <view class="scan-line"></view>
</view>
```

- [ ] **Step 2: Redesign staff workbench WXSS**

Keep `.scan-box`, `.scan-mark`, `.manual`, and `.input`. Add `.scan-line` with CSS animation:

```css
@keyframes scanLine {
  0% { transform: translateY(-48rpx); opacity: 0; }
  18% { opacity: 1; }
  100% { transform: translateY(128rpx); opacity: 0; }
}

.scan-line {
  position: absolute;
  left: 80rpx;
  right: 80rpx;
  top: 50%;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #9ff3e8, transparent);
  animation: scanLine 2200ms ease-in-out infinite;
}
```

- [ ] **Step 3: Redesign confirmation WXML/WXSS**

Keep `error`, `coupon.*`, `validToText`, `couponTail`, `contactPhoneMasked`, `bindtap="redeem"`, and `bindtap="back"`. Use checklist-style `.info-row` rows and add alert/check icons in the title area. Keep final confirm button `.btn warn`.

- [ ] **Step 4: Redesign records WXML/WXSS**

Keep `successCount`, `failedCount`, `records`, `item.*`, and status badge logic. Use `/assets/icons/check.svg` in the summary and preserve `.badge.failed` red styling.

- [ ] **Step 5: Redesign search WXML/WXSS**

Keep `phoneKeyword`, `bindinput="onKeywordInput"`, `status`, `data-status`, `bindtap="switchStatus"`, `bindtap="search"`, `coupons`, and `item.*`. Restyle `.filters` as segmented controls and result cards as voucher-like list cards.

- [ ] **Step 6: Verify staff handlers remain**

Run:

```bash
for p in staff/index staff/confirm staff/records staff/search; do echo "checking $p"; rg "bindtap|bindinput" miniprogram/pages/$p/index.wxml || true; done
```

Expected: output includes `setDemoStaff`, `scanCode`, `onTokenInput`, `checkToken`, `goRecords`, `goSearch`, `redeem`, `back`, `onKeywordInput`, `switchStatus`, and `search`.

- [ ] **Step 7: Commit**

Run:

```bash
git add miniprogram/pages/staff
git commit -m "style: redesign staff operations screens"
```

Expected: commit succeeds with only staff page files.

## Task 6: Final Verification And Polish

**Files:**
- Modify only files from Tasks 1-5 if verification finds a UI or structure issue.

- [ ] **Step 1: Check untracked/generated files**

Run:

```bash
git status --short
```

Expected: only intentional implementation files are modified. `.superpowers/` may appear as untracked companion state; do not commit it.

- [ ] **Step 2: Verify app JSON and tab icon assets**

Run:

```bash
node -e "const fs=require('fs'); const app=JSON.parse(fs.readFileSync('miniprogram/app.json','utf8')); for (const item of app.tabBar.list) { for (const key of ['iconPath','selectedIconPath']) { const asset=item[key]; if (!asset.endsWith('.png')) throw new Error('Expected png '+asset); const p='miniprogram/'+asset; if (!fs.existsSync(p)) throw new Error('Missing '+p); } } console.log('tab bar png assets verified')"
```

Expected output:

```text
tab bar png assets verified
```

- [ ] **Step 3: Verify key business handlers were not removed**

Run:

```bash
rg "goProduct|seedDemo|buyNow|bindPhoneAndBuy|bindDemoPhoneAndBuy|showCode|refreshCode|mockPay|goCoupons|goHome|goOrders|callStore|goStaff|setDemoStaff|scanCode|checkToken|redeem|search" miniprogram/pages
```

Expected: every listed handler appears in WXML or JS output.

- [ ] **Step 4: Run full project check**

Run:

```bash
npm run check
```

Expected output includes:

```text
Structure check passed
```

and Node tests pass.

- [ ] **Step 5: Inspect diff for accidental business changes**

Run:

```bash
git diff --stat
git diff -- miniprogram/app.json miniprogram/app.wxss miniprogram/pages miniprogram/assets/icons
git diff -- cloudfunctions shared tests
```

Expected: no changes under `cloudfunctions/`, `shared/`, or `tests/` unless explicitly justified by a verification failure.

- [ ] **Step 6: Commit final polish if needed**

If Step 4 or Step 5 required small fixes, commit them:

```bash
git add miniprogram
git commit -m "style: polish warm modern ui redesign"
```

Expected: commit succeeds only when there are remaining intentional polish changes.

## Self-Review

Spec coverage:

- Warm modern visual direction: covered by Tasks 1-5.
- Global UI system: covered by Task 2.
- Tab bar and page icons: covered by Task 1 and page tasks.
- User pages: covered by Tasks 3 and 4.
- Staff pages: covered by Task 5.
- Subtle animations: covered by Tasks 2, 4, and 5.
- Business behavior preservation: covered by handler checks and `npm run check` in Tasks 3-6.

Plan completeness scan:

- The plan contains no unfinished markers or fill-in-later instructions.
- Each task names exact files, exact commands, and expected verification output.

Scope check:

- This is one cohesive UI redesign with no cloud or database work. It does not need decomposition into separate specs.
