const asyncHandler = require('express-async-handler');

const {
  signUp,
  login,
  requestPasswordReset,
  resetPassword,
} = require('../services');

const { User } = require('../models');

// @desc Create new User
// @route POST /api/auth/signup
// @access public
const signUpController = asyncHandler(async (req, res, next) => {
  //* get all data from body
  const { firstName, lastName, email, password } = req.body;

  //* all the data should exists - email
  if (!(firstName && lastName && email && password)) {
    res.status(400);
    throw new Error('All fields are mandatory');
    // return res.status(400).json({ msg: 'All fields are mandatory!' });
  }

  //* check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(401);
    throw new Error('User already exists with this email');
    // return res
    //   .status(401)
    //   .json({ error: 'User already exists with this email' });
  }

  const signUpServiceRes = await signUp(req.body);
  if (signUpServiceRes.status === 500) {
    res.status(500);
    throw new Error('Internal server error');
  }

  const { status, data } = signUpServiceRes;
  req.session.accessToken = data.accessToken;
  req.session.refreshToken = data.refreshToken;

  return res.status(status).json(data);
});

// @desc Login with email and password
// @route POST /api/auth/login
// @access public
const loginController = asyncHandler(async (req, res, next) => {
  // get all data from frontend
  const { email, password } = req.body;
  if (!(email && password)) {
    res.status(400);
    throw new Error('email and password is mandatory!');
  }

  // check email and password and return token
  const loginServiceRes = await login(req.body);

  if (loginServiceRes.status === 500) {
    res.status(500);
    throw new Error('Internal server error');
  }

  switch (loginServiceRes.status) {
    case 200:
      const { data } = loginServiceRes;
      req.session.accessToken = data.accessToken;
      req.session.refreshToken = data.refreshToken;
      return res.status(200).json(data);
      break;
    case 400:
      return res.status(400).json({
        error: 'email and password is not correct',
      });
      break;
    default:
      return res.status(500).json({
        error: 'Internal server error',
      });
      break;
  }
});

// @desc User will get link for forgetting password
// @route POST /api/auth/requestResetPassword
// @access public
// todo
const resetPasswordRequestController = asyncHandler(async (req, res, next) => {
  // get email from body
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('email is mandatory to reset password!');
  }

  const passResetServiceRes = await requestPasswordReset(email);

  if (passResetServiceRes.status === 500) {
    res.status(500);
    throw new Error('Internal server error');
  }

  switch (passResetServiceRes.status) {
    case 200:
      return res.status(200).json(passResetServiceRes);
      break;
    case 404:
      return res.status(404).json(passResetServiceRes);
      break;
    default:
      return res.status(500).json({ error: 'Internal server error' });
      break;
  }
});

// @desc User will Send new password with valid token and id
// @route POST /api/auth/resetPassword
// @access public
// todo
const resetPasswordController = asyncHandler(async (req, res, next) => {
  // get email from body
  const { userId, token, password } = req.body;

  if (!(userId && token && password)) {
    res.status(400);
    throw new Error('userId, token, password is mandatory to reset password!');
  }

  const passResetServiceRes = await resetPassword(req.body);

  if (passResetServiceRes.status === 500) {
    res.status(500);
    throw new Error('Internal server error');
  }

  switch (passResetServiceRes.status) {
    case 200:
      return res.status(200).json(passResetServiceRes);
      break;
    case 404:
      return res.status(404).json(passResetServiceRes);
      break;
    default:
      return res.status(500).json({ error: 'Internal server error' });
      break;
  }
});

module.exports = {
  signUpController,
  loginController,
  resetPasswordRequestController,
  resetPasswordController,
};
