# User Phone Binding And Role Separation Design

## Goal

Add a realistic user identity layer for the bath pass mini program:

- Users are identified by WeChat `openid`.
- Users must bind a phone number once before buying.
- Users can rebind phone number from a new "我的" page.
- Staff/admin permissions remain controlled by the `staff` collection.
- Staff can contact users through phone snapshots on orders and coupons.
- The merchant workspace is visible only to staff/admin users.

## Current State

The current Demo has a working bath pass flow:

- `login` creates or updates a `users` record with `openid`.
- `staff` collection controls merchant permissions.
- `seedDemoData` initializes products, store settings, and currently adds the caller as staff.
- Bottom tabs are `套餐 / 我的券 / 商家`.
- Purchase flow does not require phone binding.
- Orders and coupons do not store contact phone snapshots.

The main gap is that user and merchant identities are too Demo-like. A regular user can see a merchant tab, and the Demo initializer can make the current user staff. The system also cannot support merchant-to-user contact yet.

## Recommended Scope

Implement the "Demo realistic" version:

- Require phone binding before purchase.
- Add a "我的" page.
- Move merchant entry into "我的", visible only to staff/admin users.
- Let users rebind phone number from "我的".
- Store phone snapshots on orders and coupons.
- Show masked user phone in merchant-facing order/coupon surfaces.
- Keep staff assignment in the database or a separate Demo-only staff setup function.

Do not implement SMS, member marketing, refund workflows, or a full staff management console in this phase.

## Identity Model

`openid` remains the primary user identity.

`phoneNumber` is contact information. It must not be used as the primary key for ownership or permissions because users can change phone numbers while keeping the same WeChat account.

`staff.openid` controls staff/admin permissions.

### User Fields

`users`:

- `_id`
- `openid`
- `nickname`
- `avatarUrl`
- `role`: `user`
- `phoneNumber`
- `phoneNumberMasked`
- `phoneBoundAt`
- `phoneUpdatedAt`
- `createdAt`
- `lastLoginAt`
- `updatedAt`

### Staff Fields

`staff`:

- `_id`
- `openid`
- `name`
- `role`: `staff` or `admin`
- `status`: `active` or `disabled`
- `createdAt`
- `updatedAt`

### Order Phone Snapshot

`orders` adds:

- `contactPhoneSnapshot`
- `contactPhoneMaskedSnapshot`

The snapshot records the phone at purchase time. If the user later rebinds phone, historical orders still show the phone used when the order was created.

### Coupon Phone Snapshot

`coupons` adds:

- `contactPhoneSnapshot`
- `contactPhoneMaskedSnapshot`

This lets merchant-side coupon lookup and redeem confirmation show contact context without joining `users` for every display.

## Phone Binding Flow

Phone binding uses the WeChat phone-number capability:

1. The mini program renders a button with `open-type="getPhoneNumber"`.
2. WeChat returns a one-time `code` after user consent.
3. The mini program calls cloud function `bindPhoneNumber` with that `code`.
4. The cloud function exchanges the code for the phone number with `cloud.openapi.phonenumber.getPhoneNumber({ code })`.
5. The cloud function updates the current `users` record by `openid`.
6. The function returns the masked phone and binding status.

The UI text should explain the purpose:

> 购买电子券需绑定手机号，便于门店核对订单和售后联系。

If the user refuses authorization, purchase stops and no order is created.

## Purchase Flow

On product detail page:

1. User taps `模拟下单并支付`.
2. Page calls `getProfile` or uses cached login state.
3. If `hasPhone` is false, show a phone binding panel.
4. User authorizes phone.
5. Page calls `bindPhoneNumber`.
6. Page calls `createOrder`.
7. Page navigates to mock payment result.

`createOrder` must also enforce phone binding server-side. If `users.phoneNumber` is missing, it returns an error:

```json
{
  "ok": false,
  "code": "PHONE_REQUIRED",
  "message": "购买前需绑定手机号"
}
```

This prevents bypassing the front-end check.

## My Page

Change tabBar from:

```text
套餐 / 我的券 / 商家
```

to:

```text
套餐 / 我的券 / 我的
```

The "我的" page includes:

- Current identity: `普通用户`, `店员`, or `管理员`.
- Phone status: `未绑定` or masked phone such as `138****0000`.
- `绑定手机号` or `换绑手机号` button.
- `我的订单` entry.
- `我的券` entry.
- `联系商家` action using `settings.store.phone`.
- `商家工作台` entry only when `isStaff` is true.
- Developer-only `openid` display for Demo testing.

The merchant tab disappears from bottom navigation for regular users. Staff still reach merchant tools through the "我的" page.

## Merchant Workspace

Keep existing merchant pages:

- Scan redeem code.
- Confirm redeem.
- Today's redeem records.

Add a merchant order/coupon lookup page:

- Search by full phone number or phone suffix.
- List recent orders/coupons.
- Show product name, coupon status, coupon number suffix, masked phone, and create time.
- Staff can tap a result to inspect basic details.

The lookup cloud function must require staff permission.

## Redeem Confirmation

Add masked phone context to redeem confirmation:

- Product name.
- Coupon status.
- Validity date.
- Coupon number suffix.
- User phone suffix or masked phone.
- Confirm redeem button.
- Cancel button.

The page should not emphasize full phone number during fast scan confirmation. Full phone can be available in merchant lookup if needed.

## Cloud Functions

### New Functions

`getProfile`

- Returns current `user`, `isStaff`, and `staff`.
- Creates the user if missing.
- Replaces repeated direct use of `login` in pages where full profile is needed.

`bindPhoneNumber`

- Accepts WeChat phone auth `code`.
- Calls `cloud.openapi.phonenumber.getPhoneNumber({ code })` in the cloud function.
- Updates `users.phoneNumber`, `phoneNumberMasked`, `phoneBoundAt`, `phoneUpdatedAt`, and `updatedAt`.
- Returns masked phone and `hasPhone`.

`getMyOrders`

- Returns current user's orders.
- Includes product snapshot, status, quantity, total, created time, and phone snapshot.

`searchMerchantCoupons`

- Requires staff.
- Accepts `phoneKeyword`, `status`, and pagination fields.
- Searches orders/coupons by phone snapshot or suffix.
- Returns merchant-facing list items.

`setCurrentUserAsDemoStaff`

- Demo-only convenience function.
- Adds the current `openid` to `staff` with a clearly marked name.
- Used for development testing instead of mixing staff setup into `seedDemoData`.

### Changed Functions

`login`

- Can stay for compatibility, but should return `user`, `hasPhone`, `isStaff`, and `staff`.
- It should not be the only source of profile truth if `getProfile` is added.

`seedDemoData`

- Creates collections, products, and settings.
- Does not add the current user to `staff`.

`createOrder`

- Fetches current user.
- Requires `users.phoneNumber`.
- Adds phone snapshots to order.

`mockPayOrder`

- Copies order phone snapshot into coupon drafts.

`checkRedeemCode`

- Returns masked phone context on the coupon.

`redeemCoupon`

- Keeps current staff permission behavior.
- Redeem logs can include `contactPhoneMaskedSnapshot` for merchant review.

## Data Privacy

Phone number is personal information. The mini program should collect it only when needed and explain the purpose before requesting authorization.

Display rules:

- User's own "我的" page can show masked phone.
- Staff lookup can show masked phone by default.
- Full phone display should be limited to explicit merchant order detail or contact action.
- Phone number must not be used as a permission key.

Before public release, the mini program privacy policy should mention phone collection for order verification, merchant contact, and after-sales service.

## Error Handling

Phone binding errors:

- User refuses authorization: show `购买前需绑定手机号，便于门店核对订单和售后联系。`
- WeChat code invalid/expired: show `手机号授权已过期，请重新授权。`
- Cloud exchange fails: show `手机号绑定失败，请稍后重试。`

Purchase errors:

- Missing phone: show phone binding panel.
- Product unavailable: show existing product unavailable message.
- Order creation failure: keep user on detail page and show toast.

Staff errors:

- Non-staff entering merchant workspace: show no-permission page.
- Staff disabled after opening page: cloud functions still reject scan/lookup/redeem.

## Testing Strategy

Use at least two WeChat accounts.

### User Account A

1. Open mini program.
2. Browse products without phone binding.
3. Open product detail.
4. Tap mock purchase.
5. Confirm phone authorization.
6. Complete mock payment.
7. Verify coupon appears in "我的券".
8. Open "我的" and verify masked phone appears.
9. Rebind phone from "我的" if a second phone authorization is available.

### Staff Account B

1. Open mini program once to create a user record.
2. Add B to `staff`, or call `setCurrentUserAsDemoStaff` in the Demo environment.
3. Open "我的".
4. Verify "商家工作台" appears.
5. Scan A's coupon QR code.
6. Verify redeem confirmation shows phone context.
7. Redeem coupon.
8. Verify today's redeem records.
9. Search by A's phone suffix in merchant lookup.

### Negative Cases

- User refuses phone authorization and cannot create order.
- User without staff permission cannot use merchant functions.
- Used coupon cannot be redeemed again.
- Expired dynamic code cannot be redeemed.
- Historical order keeps old phone snapshot after phone rebind.

## Implementation Phases

Phase 1: Profile and phone binding

- Add profile fields.
- Add `getProfile`.
- Add `bindPhoneNumber`.
- Add front-end phone binding panel.

Phase 2: My page and navigation

- Add "我的" page.
- Change tabBar.
- Move merchant entry into "我的".
- Add store contact action.

Phase 3: Purchase enforcement and snapshots

- Enforce phone binding in `createOrder`.
- Add order and coupon phone snapshots.
- Add `getMyOrders`.

Phase 4: Merchant improvements

- Update redeem confirmation with masked phone.
- Add merchant coupon/order search.
- Add Demo-only staff setup function.
- Remove staff assignment from `seedDemoData`.

Phase 5: Verification

- Update tests for phone-required purchase and masking.
- Update structure checks for new pages/functions.
- Update README with two-account testing flow.
