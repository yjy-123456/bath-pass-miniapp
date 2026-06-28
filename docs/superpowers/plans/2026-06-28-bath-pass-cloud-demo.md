# Bath Pass Cloud Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WeChat Cloud Development mini program demo for bathhouse electronic tickets with mock payment, coupon issuance, dynamic redeem codes, staff confirmation, and today's redeem records.

**Architecture:** Create a native mini program under `miniprogram/`, shared business helpers under `shared/`, cloud functions under `cloudfunctions/`, and Node-based tests under `tests/`. Cloud functions own all price/order/coupon/redeem decisions; pages call functions and render a small but complete user and staff flow.

**Tech Stack:** WeChat Mini Program WXML/WXSS/JS, WeChat Cloud Development database/functions, Node.js built-in test runner, CommonJS shared modules.

---

### Task 1: Project Skeleton And Shared Rules

**Files:**
- Create: `project.config.json`
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `shared/demoData.js`
- Create: `shared/business.js`
- Create: `tests/business.test.js`

- [x] Write Node tests for product totals, coupon quantity, expiry, and redeem-code validation.
- [x] Run `node --test tests/business.test.js` and verify the tests fail before implementation.
- [x] Implement shared demo data and business helpers.
- [x] Run `node --test tests/business.test.js` and verify the tests pass.

### Task 2: Cloud Functions

**Files:**
- Create: `cloudfunctions/login/index.js`
- Create: `cloudfunctions/seedDemoData/index.js`
- Create: `cloudfunctions/createOrder/index.js`
- Create: `cloudfunctions/mockPayOrder/index.js`
- Create: `cloudfunctions/getMyCoupons/index.js`
- Create: `cloudfunctions/generateRedeemCode/index.js`
- Create: `cloudfunctions/checkRedeemCode/index.js`
- Create: `cloudfunctions/redeemCoupon/index.js`
- Create: `cloudfunctions/getTodayRedeems/index.js`
- Create: `cloudfunctions/_shared/db.js`
- Create: `cloudfunctions/_shared/package.js`

- [x] Use cloud context openid for user-owned data.
- [x] Keep package prices server-side by reading `products`.
- [x] Mock payment changes `orders.status` to `paid` and creates coupons idempotently.
- [x] Store redeem tokens with short expiry and verify staff whitelist before lookup/redeem.

### Task 3: User Pages

**Files:**
- Create: `miniprogram/pages/home/*`
- Create: `miniprogram/pages/product/*`
- Create: `miniprogram/pages/pay-result/*`
- Create: `miniprogram/pages/coupons/*`
- Create: `miniprogram/pages/coupon-code/*`

- [x] Render package list and details from cloud data, with demo seeding fallback.
- [x] Implement quantity purchase and mock payment.
- [x] Show coupon tabs and dynamic redeem code with countdown.

### Task 4: Staff Pages

**Files:**
- Create: `miniprogram/pages/staff/index/*`
- Create: `miniprogram/pages/staff/confirm/*`
- Create: `miniprogram/pages/staff/records/*`

- [x] Display staff entry only when the user is in `staff`.
- [x] Support `wx.scanCode` plus manual token entry for demo convenience.
- [x] Require confirmation before redeeming and show today's success/failure records.

### Task 5: Verification And Docs

**Files:**
- Create: `README.md`
- Create: `scripts/check-structure.js`

- [x] Verify required files and routes exist.
- [x] Run business tests.
- [x] Document cloud environment setup, collection names, demo seed flow, and mock-payment boundary.
