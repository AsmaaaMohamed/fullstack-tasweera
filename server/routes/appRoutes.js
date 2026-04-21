const express = require('express');

const appController = require('../controllers/appController');

const router = express.Router();

router.get('/about', appController.getAboutApp);

module.exports = router;
