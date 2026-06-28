const { cloud, db, getActiveStaff, ok } = require('./_shared/db');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const now = new Date();
  const userCollection = db.collection('users');
  const existing = await userCollection.where({ openid: OPENID }).limit(1).get();

  if (existing.data.length) {
    await userCollection.doc(existing.data[0]._id).update({ data: { lastLoginAt: now } });
  } else {
    await userCollection.add({
      data: {
        openid: OPENID,
        nickname: '微信用户',
        avatarUrl: '',
        role: 'user',
        createdAt: now,
        lastLoginAt: now,
      },
    });
  }

  const staff = await getActiveStaff(OPENID);
  return ok({
    openid: OPENID,
    isStaff: Boolean(staff),
    staff,
  });
};
