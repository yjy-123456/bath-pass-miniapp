const { _, cloud, db, fail, ok, requireStaff, todayRange } = require('./_shared/db');

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();

  try {
    await requireStaff(OPENID);
  } catch (error) {
    return fail(error.message, error.code);
  }

  const { start, end } = todayRange();
  const result = await db.collection('redeemLogs')
    .where({
      createdAt: _.gte(start).and(_.lt(end)),
    })
    .orderBy('createdAt', 'desc')
    .get();

  const successCount = result.data.filter((item) => item.status === 'success').length;
  const failedCount = result.data.filter((item) => item.status === 'failed').length;

  return ok({
    successCount,
    failedCount,
    records: result.data,
  });
};
