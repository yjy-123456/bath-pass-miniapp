# Warm Modern UI Redesign Design

## Context

The project is a WeChat mini program for bathhouse electronic coupons. It already supports the full demo loop: product browsing, phone binding, mock payment, coupon issuance, QR code display, staff redemption, daily records, and coupon search.

The current UI is functional but still reads as a demo. The page structure is simple, cards are plain, icons are missing from the tab bar and menu items, and the user and staff experiences do not yet share a strong visual system.

## Goals

- Redesign the mini program with a warm, polished, local-service visual style.
- Keep all existing business behavior unchanged.
- Add local tab bar icons and page-level menu/action icons.
- Improve layout hierarchy, spacing, card design, buttons, form controls, tabs, badges, empty states, and staff tools.
- Add subtle, elegant animations that support interaction without slowing core flows.
- Apply the design consistently across user pages and staff pages.

## Non-Goals

- No cloud function changes.
- No database schema changes.
- No purchase, payment, coupon, phone binding, or redemption logic changes.
- No dependency on remote image or icon CDNs.
- No complex animation that could distract from payment or redemption tasks.

## Visual Direction

Use the confirmed "warm modern" direction:

- Page background: warm off-white / light bathhouse paper tone.
- Primary color: deep teal for brand, primary buttons, active states, and important navigation.
- Accent color: copper orange for prices, warnings, and warm service highlights.
- Supporting neutrals: slate text colors and soft borders for readability.
- Card treatment: light background, fine border, restrained shadow, 12-16rpx radius.
- Mood: approachable, refined, practical, and suitable for a neighborhood bathhouse rather than a luxury spa.

## Scope

Update these mini program surfaces:

- Global app styles and tab bar configuration.
- User pages: home, product detail, pay result, coupons, coupon code, profile, orders.
- Staff pages: workbench, redemption confirmation, daily records, coupon/order search.
- Local visual assets for tab bar icons and common page icons.

## Global UI System

Create a shared style layer in `miniprogram/app.wxss` for:

- Page spacing and background.
- Typography classes for titles, section headings, labels, helper text, and numeric emphasis.
- Cards, elevated panels, notice panels, tags, badges, dividers, rows, and stacks.
- Buttons: primary, secondary, warning, compact icon/action variants.
- Inputs and segmented controls.
- Empty states and status blocks.
- Shared animation classes such as soft page entrance, button press feedback, success pop, and scan pulse.

The shared classes should reduce repeated page CSS while staying compatible with WeChat WXML/WXSS.

## Icons

Add local icon assets under `miniprogram/assets/icons/`.

Required tab bar icons:

- Product/package icon, default and selected.
- Coupon icon, default and selected.
- Profile icon, default and selected.

Required page icons:

- Orders.
- Coupons.
- Phone.
- Contact merchant.
- Staff workbench.
- Scan.
- Records.
- Search.
- Success/check.
- Alert or warning.
- Arrow/chevron.

Use simple, consistent line icons with rounded strokes. Icons should use neutral slate for default states, deep teal for selected or primary actions, and copper orange only for warm accent states.

## User Pages

### Home

Redesign the first screen around a stronger store hero:

- Use a warm image-like or CSS visual block that suggests bathhouse service without relying on a remote image.
- Show store name, business hours, and "到店出示电子券" in the hero.
- Place the demo notice below the hero as a softer service notice.
- Redesign product cards with title, description, price, small metadata, and a clear secondary action.
- Keep the demo seed button, but visually demote it as a development action.

### Product Detail

Turn the page into a clearer purchase experience:

- Product summary card with name, description, price, and detail copy.
- "套餐包含" and "使用规则" as icon-assisted lists.
- Quantity stepper with stable sizing and clearer minus/plus controls.
- Total price row that visually anchors the purchase decision.
- Phone binding panel styled as a warm notice/action area when needed.
- Keep the existing manual demo phone binding flow.

### Coupons

Improve coupon browsing:

- Segmented tabs with counts and a clear active state.
- Coupon cards that look more like vouchers, with status badge, coupon number, validity, and action.
- Unused coupons should make "查看二维码" easy to find.
- Empty state should include a simple icon and helpful text.

### Coupon Code

Make the QR code screen feel trustworthy and scannable:

- Use a centered ticket-style card.
- Place the QR code in a clean framed area.
- Show coupon name, coupon number, validity, dynamic token, and countdown with clear hierarchy.
- Add a subtle timer accent for the expiring dynamic code.
- Keep long-press QR behavior unchanged.

### Pay Result

Polish the confirmation flow:

- Use success or payment pending status icon.
- Add a contained result card with action hierarchy: primary next action first, secondary return action second.
- Use a restrained success pop animation after mock payment.

### Profile

Make "我的" feel like an account center:

- Add a profile header with identity and phone status.
- Keep real WeChat phone binding and demo manual binding.
- Redesign menu rows with icons, labels, chevrons, and staff-specific emphasis.
- Keep debug openid visible but visually separated as a demo/debug area.

### Orders

Improve order scanning:

- Order cards should show package name, status badge, order number, time, quantity, total, and phone snapshot.
- Use consistent metadata rows and subtle dividers.
- Empty state should match the coupon empty state style.

## Staff Pages

### Staff Workbench

Redesign for fast operation:

- If not staff, keep the permission denial flow with a clearer explanation and demo staff action.
- For staff, make scanning the dominant primary operation with a dark teal scan panel.
- Add scan corner marks and a subtle scan pulse or line animation.
- Keep manual token input below as a secondary card.
- Add icon buttons or rows for daily records and order/coupon search.

### Redemption Confirmation

Make the confirmation page act like a checklist:

- Show clear "待确认核销" or error state.
- Display package, status, validity, coupon tail, and masked phone in consistent rows.
- Use warning styling for the final "确认核销" button.
- Keep cancel/back action secondary.

### Daily Records

Improve operational review:

- Summary card with success and failed counts.
- Record cards with time, product, coupon number, staff, and status badge.
- Failed status should use a red-tinted badge.
- Empty state should be consistent with the rest of the app.

### Coupon Search

Improve search usability:

- Search card with input, segmented status filters, and primary query action.
- Result cards should use the same voucher/list language as coupons and records.
- Empty state should distinguish "not searched yet" only if current JS state already supports it; otherwise keep a generic no-results state.

## Animations

Use subtle WXSS animations:

- Page/card entrance: short fade-up for major cards.
- Button tap feedback: use `hover-class` or WXSS active classes where appropriate.
- Success icon pop for payment and record summary states.
- Scan panel pulse or scan line loop for the staff workbench.

Animations must be lightweight, CSS-only, and should not block interactions or rely on JavaScript timers beyond existing business timers.

## Implementation Boundaries

Expected files to change:

- `miniprogram/app.json`
- `miniprogram/app.wxss`
- `miniprogram/pages/**/index.wxml`
- `miniprogram/pages/**/index.wxss`
- `miniprogram/assets/icons/**`

Expected files not to change:

- `cloudfunctions/**`
- `shared/**`
- business tests unless needed for existing checks

The redesign may add WXML wrappers, icon images, labels, and class names, but it must not change event handlers, data bindings, route paths, or cloud function call behavior.

## Verification

Run:

```bash
npm run check
```

Also review the changed WXML/WXSS for:

- Valid mini program asset paths.
- No missing tab bar icon files.
- No removed event handlers.
- No layout text overflow in compact mobile widths.
- Staff and user pages sharing the same visual language.

## Risks

- WeChat tab bar icon paths are strict; missing files would break tab bar rendering.
- Adding icons to many menu rows can accidentally disturb tap targets if wrappers are not carefully structured.
- Overly broad shared CSS could conflict with page-specific classes, so shared class names should stay intentional and page overrides should be small.
- CSS animation support in WeChat is good for simple transforms and opacity, but complex effects should be avoided.
