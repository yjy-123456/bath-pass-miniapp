const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

function ok(data = {}) {
  return { ok: true, ...data };
}

function fail(message, code = 'BAD_REQUEST', data = {}) {
  return { ok: false, code, message, ...data };
}

async function getActiveStaff(openid) {
  const result = await db.collection('staff')
    .where({ openid, status: 'active' })
    .limit(1)
    .get();
  return result.data[0] || null;
}

async function requireStaff(openid) {
  const staff = await getActiveStaff(openid);
  if (!staff) {
    const error = new Error('店员无权限');
    error.code = 'NO_STAFF_PERMISSION';
    throw error;
  }
  return staff;
}

async function getById(collectionName, id) {
  const result = await db.collection(collectionName).doc(id).get();
  return result.data;
}

async function findOne(collectionName, where) {
  const result = await db.collection(collectionName).where(where).limit(1).get();
  return result.data[0] || null;
}

function todayRange(now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

module.exports = {
  _,
  cloud,
  db,
  fail,
  findOne,
  getActiveStaff,
  getById,
  ok,
  requireStaff,
  todayRange,
};
