// Middle East countries with ISO codes, names, dial codes, and flag URLs
export const middleEastCountries = [
  {
    code: "EG",
    name: "Egypt",
    dial: "+20",
    flag: "https://flagcdn.com/w40/eg.png",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dial: "+966",
    flag: "https://flagcdn.com/w40/sa.png",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dial: "+971",
    flag: "https://flagcdn.com/w40/ae.png",
  },
  {
    code: "KW",
    name: "Kuwait",
    dial: "+965",
    flag: "https://flagcdn.com/w40/kw.png",
  },
  {
    code: "QA",
    name: "Qatar",
    dial: "+974",
    flag: "https://flagcdn.com/w40/qa.png",
  },
  {
    code: "BH",
    name: "Bahrain",
    dial: "+973",
    flag: "https://flagcdn.com/w40/bh.png",
  },
  {
    code: "OM",
    name: "Oman",
    dial: "+968",
    flag: "https://flagcdn.com/w40/om.png",
  },
  {
    code: "JO",
    name: "Jordan",
    dial: "+962",
    flag: "https://flagcdn.com/w40/jo.png",
  },
  {
    code: "LB",
    name: "Lebanon",
    dial: "+961",
    flag: "https://flagcdn.com/w40/lb.png",
  },
  {
    code: "SY",
    name: "Syria",
    dial: "+963",
    flag: "https://flagcdn.com/w40/sy.png",
  },
  {
    code: "IQ",
    name: "Iraq",
    dial: "+964",
    flag: "https://flagcdn.com/w40/iq.png",
  },
  {
    code: "YE",
    name: "Yemen",
    dial: "+967",
    flag: "https://flagcdn.com/w40/ye.png",
  },
  {
    code: "PS",
    name: "Palestine",
    dial: "+970",
    flag: "https://flagcdn.com/w40/ps.png",
  },
  {
    code: "IR",
    name: "Iran",
    dial: "+98",
    flag: "https://flagcdn.com/w40/ir.png",
  },
  {
    code: "TR",
    name: "Turkey",
    dial: "+90",
    flag: "https://flagcdn.com/w40/tr.png",
  },
  {
    code: "IL",
    name: "Israel",
    dial: "+972",
    flag: "https://flagcdn.com/w40/il.png",
  },
];

// Get country by dial code
export const getMiddleEastCountryByDialCode = (dialCode) => {
  return middleEastCountries.find((country) => country.dial === dialCode);
};

// Get country by ISO code
export const getMiddleEastCountryByISO = (isoCode) => {
  return middleEastCountries.find(
    (country) => country.code.toLowerCase() === isoCode.toLowerCase()
  );
};

// Get country by name
export const getMiddleEastCountryByName = (countryName) => {
  return middleEastCountries.find((country) => country.name === countryName);
};
