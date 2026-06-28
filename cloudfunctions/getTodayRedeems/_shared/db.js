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

async function getOrCreateUser(openid) {
  const now = new Date();
  const users = db.collection('users');
  const existing = await users.where({ openid }).limit(1).get();

  if (existing.data.length) {
    await users.doc(existing.data[0]._id).update({
      data: {
        lastLoginAt: now,
        updatedAt: now,
      },
    });
    return { ...existing.data[0], lastLoginAt: now, updatedAt: now };
  }

  const user = {
    openid,
    nickname: '微信用户',
    avatarUrl: '',
    role: 'user',
    phoneNumber: '',
    phoneNumberMasked: '',
    phoneBoundAt: null,
    phoneUpdatedAt: null,
    createdAt: now,
    lastLoginAt: now,
    updatedAt: now,
  };
  const result = await users.add({ data: user });
  return { _id: result._id, ...user };
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
  getOrCreateUser,
  ok,
  requireStaff,
  todayRange,
};
