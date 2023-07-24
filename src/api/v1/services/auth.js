const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { randomBytes } = require('node:crypto');
const { generateAccessToken, generateRefreshToken } = require('../utils');

const { BCRYPT_SALT } = process.env;

const signUp = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;

    // encrypt the password
    const encPassword = await bcrypt.hash(password, Number(BCRYPT_SALT));

    // save the user in DB
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: encPassword,
    });

    // generate a toke for user and send it
    const userTokenInfo = {
      id: user._id,
      email,
    };
    const accessToken = generateAccessToken(userTokenInfo);
    const refreshToken = generateRefreshToken(userTokenInfo);

    // send a accessToken and refreshToken
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    user.password = undefined; // for not sending to the client

    return { status: 201, data: user };
  } catch (error) {
    console.log(error);
    return {
      status: 500,
    };
  }
};

const login = async (userData) => {
  try {
    const { email, password } = userData;

    // find user in DB
    const user = await User.findOne({ email });
    // match the password
    if (user && (await bcrypt.compare(password, user.password))) {
      const userTokenInfo = {
        id: user._id,
        email,
      };
      const accessToken = generateAccessToken(userTokenInfo);
      const refreshToken = generateRefreshToken(userTokenInfo);

      // send a accessToken and refreshToken
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      user.password = undefined;

      return { status: 200, data: user };
    }

    return { status: 400 };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
};

const requestPasswordReset = async () => {
  const resetStr = randomBytes(256).toString('hex');
};

const resetPassword = async () => {};

module.exports = { signUp, login, requestPasswordReset, resetPassword };
