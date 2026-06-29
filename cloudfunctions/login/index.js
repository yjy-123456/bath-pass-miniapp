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
