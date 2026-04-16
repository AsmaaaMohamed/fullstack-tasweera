const catchAsync = require('../utils/catchAsync');
const Country = require('../models/countryModel');
const City = require('../models/cityModel');
const Region = require('../models/regionModel');

exports.getAllCountries = catchAsync(async (req, res) => {
  const countries = await Country.find({ isActive: true })
    .sort({ id: 1 })
    .select({ _id: 0, id: 1, name: 1, code: 1, dialCode: 1 });

  res.status(200).json({
    success: true,
    results: countries.length,
    data: countries,
  });
});

exports.getCities = catchAsync(async (req, res) => {
  const { country_code, country_id } = req.query;

  if (!country_code && !country_id) {
    return res.status(400).json({
      success: false,
      message: 'country_code or country_id is required',
    });
  }

  const cityFilter = { isActive: true };

  if (country_code) {
    cityFilter.country_code = String(country_code).toUpperCase();
  }

  if (country_id) {
    cityFilter.country_id = Number(country_id);
  }

  const cities = await City.find(cityFilter)
    .sort({ name: 1 })
    .select({ _id: 0, id: 1, name: 1, country_id: 1, country_code: 1 });

  res.status(200).json({
    success: true,
    results: cities.length,
    data: cities,
  });
});

exports.getRegions = catchAsync(async (req, res) => {
  const { city_id } = req.query;

  if (!city_id) {
    return res.status(400).json({
      success: false,
      message: 'city_id is required',
    });
  }

  const regions = await Region.find({
    city_id: Number(city_id),
    isActive: true,
  })
    .sort({ name: 1 })
    .select({ _id: 0, id: 1, name: 1, city_id: 1, country_id: 1, country_code: 1 });

  res.status(200).json({
    success: true,
    results: regions.length,
    data: regions,
  });
});
