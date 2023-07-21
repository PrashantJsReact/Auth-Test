const express = require('express');
const router = express.Router();
const {
  signUpController,
  loginController,
  resetPasswordRequestController,
  resetPasswordController,
} = require('../controllers/auth');

router.post('/signup', signUpController);
router.post('/login', loginController);
router.post('/requestResetPassword', resetPasswordRequestController);
router.post('/resetPassword', resetPasswordController);
