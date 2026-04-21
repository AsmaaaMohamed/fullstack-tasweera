const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/customer/register', authController.registerCustomer);
router.post('/customer/login-with-email', authController.loginCustomerWithEmail);

router.post('/artist/register', authController.registerArtist);
router.post('/artist/login', authController.loginArtistWithEmail);

router.post('/logout', authController.logout);
router.get('/me', authController.protect, authController.getMe);

module.exports = router;
