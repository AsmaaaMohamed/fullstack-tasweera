const express = require('express');
const router = express.Router();
const { getAllCountries, getCities,getRegions } = require('../controllers/locationController');

router.get('/countries', getAllCountries);
router.get('/cities', getCities);
router.get('/regions', getRegions);

module.exports = router;