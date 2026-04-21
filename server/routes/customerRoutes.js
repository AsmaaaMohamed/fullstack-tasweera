const express = require('express');

const customerController = require('../controllers/customerController');

const router = express.Router();

router.get('/home', customerController.getCustomerHome);
router.get('/stories', customerController.getCustomerStories);

module.exports = router;
