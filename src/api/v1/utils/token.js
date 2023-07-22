const jwt = require('jsonwebtoken');

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;

const generateAccessToken = (userInfo) => {
  return jwt.sign(userInfo, JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (userInfo) => {
  return jwt.sign(userInfo, JWT_REFRESH_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
