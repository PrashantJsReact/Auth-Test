const {
  signUp,
  login,
  requestPasswordReset,
  resetPassword,
} = require('../services');

const { User } = require('../models');

const signUpController = async (req, res, next) => {
  try {
    //* get all data from body
    const { firstName, lastName, email, password } = req.body;

    //* all the data should exists - email
    if (!(firstName && lastName && email && password)) {
      return res.status(400).json({ msg: 'All fields are mandatory!' });
    }

    //* check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ error: 'User already exists with this email' });
    }

    const signUpServiceRes = await signUp(req.body);
    if (signUpServiceRes.status === 500) {
      res.status(500).json({ error: 'Internal server error' });
    }

    const { data } = signUpServiceRes;
    req.session.accessToken = data.accessToken;
    req.session.refreshToken = data.refreshToken;

    return res.status(201).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const loginController = async (req, res, next) => {
  try {
    // get all data from frontend
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ err: 'email and password is mandatory!' });
    }

    // check email and password and return token
    const loginServiceRes = await login(req.body);

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
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// todo
const resetPasswordRequestController = async (req, res, next) => {
  // get email from body
  const { email } = req.body;

  if (!email) {
    return res
      .status(401)
      .json({ error: 'email is mandatory to reset password!' });
  }

  try {
    const passResetServiceRes = await requestPasswordReset(email);

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
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// todo
const resetPasswordController = async (req, res, next) => {
  // get email from body
  const { userId, token, password } = req.body;

  if (!(userId && token && password)) {
    return res.status(401).json({
      error: 'userId, token, password is mandatory to reset password!',
    });
  }

  try {
    const passResetServiceRes = await resetPassword(req.body);

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
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  signUpController,
  loginController,
  resetPasswordRequestController,
  resetPasswordController,
};
