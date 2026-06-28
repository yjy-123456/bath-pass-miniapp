const demoProducts = [
  {
    _id: 'single-bath',
    name: '单人洗浴票',
    description: '含洗浴入场 1 次，不含搓澡和加钟',
    detail: '适合单人到店洗浴使用，购买后自动发券。',
    includes: ['洗浴入场 1 次', '公共浴区使用', '休息区使用'],
    priceFen: 2900,
    originalPriceFen: 3500,
    validityDays: 30,
    couponCopies: 1,
    rules: [
      '电子券自支付成功日起 30 天内有效。',
      '每张券仅可核销 1 次，核销后不可重复使用。',
      '不含搓澡、加钟、饮品等额外消费。',
    ],
    refundRule: 'Demo 阶段仅展示退款规则占位，真实上线前需补充商家确认的退款规则。',
    status: 'active',
    sort: 10,
  },
  {
    _id: 'bath-scrub',
    name: '洗浴 + 搓澡套餐',
    description: '含入场 1 次 + 基础搓澡 1 次',
    detail: '到店后向店员出示电子券，核销后安排基础搓澡服务。',
    includes: ['洗浴入场 1 次', '基础搓澡 1 次', '休息区使用'],
    priceFen: 5900,
    originalPriceFen: 6900,
    validityDays: 30,
    couponCopies: 1,
    rules: [
      '搓澡服务需按门店现场排队安排。',
      '升级项目或加钟费用需到店另付。',
      '核销前请确认套餐名称，核销后不可撤销。',
    ],
    refundRule: '未核销券可按门店规则处理退款，Demo 不发起真实退款。',
    status: 'active',
    sort: 20,
  },
  {
    _id: 'friend-duo',
    name: '亲友双人票',
    description: '一次购买生成 2 张券，可分开核销',
    detail: '适合两人同行或分次赠予亲友使用，支付成功后每份套餐生成 2 张独立电子券。',
    includes: ['洗浴入场 2 次', '两张独立电子券', '可分开到店核销'],
    priceFen: 5500,
    originalPriceFen: 7000,
    validityDays: 30,
    couponCopies: 2,
    rules: [
      '每张券对应 1 人 1 次洗浴入场。',
      '两张券可分开核销，也可同日核销。',
      '截图转发存在风险，请以小程序动态码为准。',
    ],
    refundRule: '任一券核销后，整单退款规则需由门店确认。',
    status: 'active',
    sort: 30,
  },
];

const storeInfo = {
  name: '清泉浴池',
  hours: '10:00-23:30',
  address: '示例市朝阳路 18 号',
  phone: '138-0000-0000',
  notice: '购买后自动发券。电子券有效期 30 天，Demo 阶段使用模拟支付，不产生真实收款。',
};

module.exports = {
  demoProducts,
  storeInfo,
};
