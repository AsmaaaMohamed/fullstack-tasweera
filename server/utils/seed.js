const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Country = require("../models/countryModel");
const City = require("../models/cityModel");
const Region = require("../models/regionModel");
const locationSeedData = require("../data/locationSeedData");

dotenv.config({ path: "./.env" });

const databaseUrl = process.env.DATABASE?.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

const buildDocuments = () => {
  const countries = [];
  const cities = [];
  const regions = [];

  locationSeedData.forEach((country) => {
    countries.push({
      id: country.id,
      name: country.name,
      code: country.code,
      dialCode: country.dialCode,
      isActive: true,
    });

    country.cities.forEach((city) => {
      cities.push({
        id: city.id,
        name: city.name,
        country_id: country.id,
        country_code: country.code,
        isActive: true,
      });

      city.regions.forEach((regionName, index) => {
        regions.push({
          id: city.id * 10 + index + 1,
          name: regionName,
          city_id: city.id,
          country_id: country.id,
          country_code: country.code,
          isActive: true,
        });
      });
    });
  });

  return { countries, cities, regions };
};

const seedLocations = async () => {
  if (!databaseUrl) {
    throw new Error("DATABASE connection string is missing");
  }

  const { countries, cities, regions } = buildDocuments();

  await mongoose.connect(databaseUrl);
  console.log("DB connection successful");

  await Country.deleteMany({});
  await City.deleteMany({});
  await Region.deleteMany({});

  await Country.insertMany(countries);
  await City.insertMany(cities);
  await Region.insertMany(regions);

  console.log(
    `Seeded ${countries.length} countries, ${cities.length} cities, and ${regions.length} regions`
  );
};

seedLocations()
  .then(async () => {
    await mongoose.disconnect();
    console.log("Seeding complete");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seeding failed:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
