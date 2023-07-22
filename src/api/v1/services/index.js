const {
  signUp,
  login,
  requestPasswordReset,
  resetPassword,
} = require('./auth');

module.exports = { signUp, login, requestPasswordReset, resetPassword };
