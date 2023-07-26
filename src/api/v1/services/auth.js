const bcrypt = require('bcryptjs');
const { randomBytes } = require('node:crypto');
const { User } = require('../models');
const { Token } = require('../models');

const { generateAccessToken, generateRefreshToken } = require('../utils');

const { BCRYPT_SALT, CLIENT_URL } = process.env;

const signUp = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;

    // encrypt the password
    const salt = await bcrypt.genSalt(Number(BCRYPT_SALT));
    const encPassword = await bcrypt.hash(password, salt);

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

// todo
const requestPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ email });
    // if (!user) throw new Error('Email does not exist');
    if (!user) return { status: 404, error: 'Email does not exist' };

    // if token is already there first delete token
    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    const resetStr = randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetStr, Number(BCRYPT_SALT));

    token = new Token({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    });

    await token.save();

    const resetPasswordLink = `${CLIENT_URL}/password-reset?token=${resetStr}&id=${user._id}`;
    console.log(resetPasswordLink);

    // send email with link

    return { status: 200, resetPasswordLink };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
};

// todo
const resetPassword = async (body) => {
  const { userId, token, password } = body;
  try {
    // check if token exist into DB
    const passwordResetToken = await Token.findOne({ userId });
    if (!passwordResetToken) {
      return { status: 404, error: 'Invalid or expired password reset token' };
    }

    // compare token with DB token
    const isValid = await bcrypt.compare(token, passwordResetToken.token);

    if (!isValid) {
      return { status: 404, error: "Invalid or token does'nt match" };
    }

    const hash = await bcrypt.hash(password, Number(BCRYPT_SALT));

    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );

    const user = await User.findById({ _id: userId });

    // send user email that password changed successfully

    await passwordResetToken.deleteOne();

    return { status: 200, message: 'Password reset was successful' };
  } catch (error) {
    console.log(error);
    return { status: 500 };
  }
};

module.exports = { signUp, login, requestPasswordReset, resetPassword };
