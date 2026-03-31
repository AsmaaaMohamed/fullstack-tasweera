const catchAsync = require('../utils/catchAsync');
const { Country, State, City, Region, Timezone } = require('countrydata.js');

exports.getAllCountries = catchAsync(async (req, res) => {
    const countries =  Region.getRegionsByCountryCode('EG');
    res.status(200).json({
        success: true,
        result: countries.length,
        data: { countries }
    });
});