require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 7
};