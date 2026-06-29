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
