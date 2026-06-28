# 澡堂电子券小程序 Demo

这是基于微信云开发的澡堂电子券小程序 Demo，覆盖“浏览套餐 -> 模拟支付 -> 自动发券 -> 出示动态码 -> 店员确认核销 -> 今日记录”的第一阶段闭环。

## 第一阶段边界

- 使用微信云开发，不需要自建服务器。
- 使用模拟支付，不接真实微信支付，不产生真实收款。
- 单店版本，套餐、订单、电子券、动态核销码和店员白名单都在云数据库中。
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
5. 在微信开发者工具中逐个上传并部署 `cloudfunctions/` 下的云函数。
6. 打开小程序首页，点击“初始化 Demo 数据”。当前微信 openid 会被写入 `staff` 白名单。
7. 体验用户端购买：套餐详情 -> 模拟下单并支付 -> 查看我的券 -> 查看二维码。
8. 体验商家端核销：商家页扫码，或把券二维码页里的 `BATHPASS:` 动态码复制到手动输入框。

券二维码页显示的是标准 QR Code，内容为短期有效的 `BATHPASS:` 动态码。若修改过二维码生成逻辑，请重新上传部署 `generateRedeemCode` 云函数，并选择“云端安装依赖”。

## 本地校验

```bash
npm run check
```

该命令会同步云函数共享模块、运行业务测试，并检查小程序页面与云函数文件是否齐全。

## 常见问题

### 上传云函数提示“请在编辑器云函数根目录选择一个云环境”

这表示微信开发者工具还没有把 `cloudfunctions/` 目录绑定到当前云环境。请在开发者工具左侧文件树找到 `cloudfunctions` 云函数根目录，在该目录的环境选择入口中选择你的云环境，然后再右键单个云函数目录上传部署。若文件树没有出现云函数环境选择入口，请确认 `project.config.json` 中存在 `"cloudfunctionRoot": "cloudfunctions/"`，保存后关闭并重新导入项目。
