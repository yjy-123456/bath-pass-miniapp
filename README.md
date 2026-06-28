# 澡堂电子券小程序 Demo

这是基于微信云开发的澡堂电子券小程序 Demo，覆盖“浏览套餐 -> 购买前绑定手机号 -> 模拟支付 -> 自动发券 -> 出示动态码 -> 店员确认核销 -> 今日记录”的第一阶段闭环。

## 第一阶段边界

- 使用微信云开发，不需要自建服务器。
- 使用模拟支付，不接真实微信支付，不产生真实收款。
- 单店版本，套餐、订单、电子券、动态核销码、用户手机号快照和店员白名单都在云数据库中。
- 真实上线前需要商家自己的小程序主体、微信支付商户号、退款规则和正式资金流。

## 目录

- `miniprogram/`：微信小程序页面和全局配置。
- `cloudfunctions/`：云函数。每个函数目录内都有 `_shared`，可单独上传。
- `shared/`：可测试的业务规则和 Demo 数据源。
- `tests/`：Node 本地业务测试。
- `scripts/prepare-cloudfunctions.js`：把共享模块同步进每个云函数目录。

## 云数据库集合

请在云开发控制台创建或让云函数自动写入这些集合：

- `users`
- `products`
- `orders`
- `coupons`
- `redeemCodes`
- `staff`
- `redeemLogs`
- `settings`

Demo 可先把集合权限保持为“仅创建者可读写”或更严格，业务读写都通过云函数完成。

## 使用步骤

1. 在微信开发者工具中导入本目录。
2. 修改 `project.config.json` 的 `appid` 为你自己的小程序 AppID。
3. 如果有固定云环境，修改 `miniprogram/app.js` 中 `globalData.envId`。
4. 执行 `npm run prepare:cloud`，确保每个云函数目录带有 `_shared` 和 `package.json`。
5. 在微信开发者工具中逐个上传并部署 `cloudfunctions/` 下的云函数，建议统一选择“上传并部署：云端安装依赖”。
6. 打开小程序首页，点击“初始化 Demo 数据”。该操作只初始化套餐和门店信息，不再自动授权店员。
7. 体验用户端购买：套餐详情 -> 模拟下单并支付 -> 授权手机号 -> 模拟支付成功 -> 查看我的券 -> 查看二维码。
8. 体验商家端核销：进入“我的”页，在 Demo 调试区将当前账号设为 Demo 店员，打开“商家工作台”扫码，或把券二维码页里的 `BATHPASS:` 动态码复制到手动输入框。

券二维码页显示的是标准 QR Code，内容为短期有效的 `BATHPASS:` 动态码。若修改过二维码生成逻辑，请重新上传部署 `generateRedeemCode` 云函数，并选择“云端安装依赖”。

## 云函数清单

当前共 15 个云函数：

- `login`
- `getProfile`
- `bindPhoneNumber`
- `seedDemoData`
- `getProducts`
- `createOrder`
- `mockPayOrder`
- `getMyOrders`
- `getMyCoupons`
- `generateRedeemCode`
- `checkRedeemCode`
- `redeemCoupon`
- `getTodayRedeems`
- `searchMerchantCoupons`
- `setCurrentUserAsDemoStaff`

涉及手机号授权、二维码生成或云 SDK 的函数都应选择“上传并部署：云端安装依赖”。

## 角色和手机号

- `openid` 是系统主身份，用来判断订单和券归属。
- 手机号是联系方式，购买前必须绑定一次，后续可在“我的”页换绑。
- 创建订单时会保存 `contactPhoneSnapshot` 和 `contactPhoneMaskedSnapshot`。
- 发券时会把订单手机号快照复制到券上，方便商家查询和售后联系。
- 店员权限由 `staff` 集合控制，`staff.openid` 匹配当前微信用户才可进入商家能力。
- `seedDemoData` 不再自动授权店员；测试时可在“我的”页 Demo 调试区点击“设为 Demo 店员”。

## 双账号测试流程

### 用户账号 A

1. 打开小程序，进入套餐详情。
2. 点击“模拟下单并支付”。
3. 首次购买会出现手机号授权，授权后继续下单。
4. 点击确认模拟支付。
5. 在“我的券”查看电子券和二维码。
6. 在“我的”查看脱敏手机号，在“我的订单”查看订单手机号快照。

### 店员账号 B

1. 打开小程序，进入“我的”。
2. 如果不是店员，在“我的”页 Demo 调试区点击“设为 Demo 店员”；正式测试也可以手动在 `staff` 集合写入 B 的 `openid`。
3. 进入“商家工作台”。
4. 扫用户 A 的券二维码，或手动输入 `BATHPASS:` 动态码。
5. 在核销确认页检查套餐、券号、有效期和用户脱敏手机号。
6. 确认核销。
7. 在今日核销记录确认成功记录。
8. 在“订单/券查询”中用用户手机号后 4 位搜索券。

## 本地校验

```bash
npm run check
```

该命令会同步云函数共享模块、运行业务测试，并检查小程序页面与云函数文件是否齐全。

## 常见问题

### 上传云函数提示“请在编辑器云函数根目录选择一个云环境”

这表示微信开发者工具还没有把 `cloudfunctions/` 目录绑定到当前云环境。请在开发者工具左侧文件树找到 `cloudfunctions` 云函数根目录，在该目录的环境选择入口中选择你的云环境，然后再右键单个云函数目录上传部署。若文件树没有出现云函数环境选择入口，请确认 `project.config.json` 中存在 `"cloudfunctionRoot": "cloudfunctions/"`，保存后关闭并重新导入项目。
