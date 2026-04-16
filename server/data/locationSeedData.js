const locationSeedData = [
  {
    id: 1,
    code: "EG",
    name: "Egypt",
    dialCode: "+20",
    cities: [
      { id: 101, name: "Cairo", regions: ["Nasr City", "Heliopolis", "Maadi", "New Cairo"] },
      { id: 102, name: "Alexandria", regions: ["Sidi Gaber", "Smouha", "Gleem", "Montaza"] },
      { id: 103, name: "Giza", regions: ["Dokki", "Mohandessin", "Haram", "6th of October"] },
    ],
  },
  {
    id: 2,
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    cities: [
      { id: 201, name: "Riyadh", regions: ["Olaya", "Al Malaz", "Al Yasmin", "Diriyah"] },
      { id: 202, name: "Jeddah", regions: ["Al Rawdah", "Al Salamah", "Al Hamra", "Obhur"] },
      { id: 203, name: "Dammam", regions: ["Al Faisaliyah", "Al Shati", "Al Adamah", "Al Aziziyah"] },
    ],
  },
  {
    id: 3,
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    cities: [
      { id: 301, name: "Dubai", regions: ["Downtown Dubai", "Deira", "Jumeirah", "Dubai Marina"] },
      { id: 302, name: "Abu Dhabi", regions: ["Al Khalidiyah", "Al Zahiyah", "Madinat Zayed", "Khalifa City"] },
      { id: 303, name: "Sharjah", regions: ["Al Majaz", "Al Nahda", "Muwaileh", "Al Khan"] },
    ],
  },
  {
    id: 4,
    code: "KW",
    name: "Kuwait",
    dialCode: "+965",
    cities: [
      { id: 401, name: "Kuwait City", regions: ["Sharq", "Dasman", "Qibla", "Bneid Al Gar"] },
      { id: 402, name: "Hawally", regions: ["Salmiya", "Jabriya", "Rumaithiya", "Bayan"] },
      { id: 403, name: "Farwaniya", regions: ["Ardiya", "Khaitan", "Abdullah Al Mubarak", "Omariya"] },
    ],
  },
  {
    id: 5,
    code: "QA",
    name: "Qatar",
    dialCode: "+974",
    cities: [
      { id: 501, name: "Doha", regions: ["West Bay", "Al Sadd", "Musherib", "The Pearl"] },
      { id: 502, name: "Al Rayyan", regions: ["Education City", "Muaither", "Al Gharrafa", "Old Al Rayyan"] },
      { id: 503, name: "Al Wakrah", regions: ["Al Wakrah Souq", "Ezdan", "Al Wukair", "Mesaieed Road"] },
    ],
  },
  {
    id: 6,
    code: "BH",
    name: "Bahrain",
    dialCode: "+973",
    cities: [
      { id: 601, name: "Manama", regions: ["Juffair", "Seef", "Adliya", "Hoora"] },
      { id: 602, name: "Muharraq", regions: ["Busaiteen", "Arad", "Hidd", "Galali"] },
      { id: 603, name: "Riffa", regions: ["East Riffa", "West Riffa", "Isa Town", "A'ali"] },
    ],
  },
  {
    id: 7,
    code: "OM",
    name: "Oman",
    dialCode: "+968",
    cities: [
      { id: 701, name: "Muscat", regions: ["Al Khuwair", "Qurum", "Madinat Sultan Qaboos", "Muttrah"] },
      { id: 702, name: "Salalah", regions: ["Al Haffa", "Awqad", "Saadah", "Dahariz"] },
      { id: 703, name: "Sohar", regions: ["Al Hambar", "Falaj", "Al Tareif", "Majis"] },
    ],
  },
  {
    id: 8,
    code: "JO",
    name: "Jordan",
    dialCode: "+962",
    cities: [
      { id: 801, name: "Amman", regions: ["Abdoun", "Jabal Amman", "Khalda", "Sweifieh"] },
      { id: 802, name: "Zarqa", regions: ["New Zarqa", "Russeifa", "Awajan", "Hashmiya"] },
      { id: 803, name: "Irbid", regions: ["Al Hashmi", "University District", "Madinah", "Aydoun"] },
    ],
  },
  {
    id: 9,
    code: "LB",
    name: "Lebanon",
    dialCode: "+961",
    cities: [
      { id: 901, name: "Beirut", regions: ["Hamra", "Achrafieh", "Verdun", "Mar Mikhael"] },
      { id: 902, name: "Tripoli", regions: ["El Mina", "Bab Al Tabbaneh", "Zahrieh", "Qobbeh"] },
      { id: 903, name: "Sidon", regions: ["Saida Old City", "Haret Saida", "Abra", "Hlaliyeh"] },
    ],
  },
  {
    id: 10,
    code: "SY",
    name: "Syria",
    dialCode: "+963",
    cities: [
      { id: 1001, name: "Damascus", regions: ["Mazzeh", "Abu Rummaneh", "Kafr Sousa", "Barzeh"] },
      { id: 1002, name: "Aleppo", regions: ["Aziziyeh", "Sulaimaniyah", "New Aleppo", "Sheikh Maqsoud"] },
      { id: 1003, name: "Homs", regions: ["Al Waer", "Al Hamra", "Karam Al Zeitoun", "Inshaat"] },
    ],
  },
  {
    id: 11,
    code: "IQ",
    name: "Iraq",
    dialCode: "+964",
    cities: [
      { id: 1101, name: "Baghdad", regions: ["Karrada", "Mansour", "Adhamiyah", "Sadr City"] },
      { id: 1102, name: "Basra", regions: ["Al Ashar", "Al Maqal", "Al Jubaila", "Abu Al Khaseeb"] },
      { id: 1103, name: "Erbil", regions: ["Ankawa", "Soran", "Dream City", "Kasnazan"] },
    ],
  },
  {
    id: 12,
    code: "YE",
    name: "Yemen",
    dialCode: "+967",
    cities: [
      { id: 1201, name: "Sanaa", regions: ["Al Tahrir", "Shu'ub", "Al Safiyah", "Ma'een"] },
      { id: 1202, name: "Aden", regions: ["Crater", "Khormaksar", "Sheikh Othman", "Al Mualla"] },
      { id: 1203, name: "Taiz", regions: ["Al Qahirah", "Al Mudhaffar", "Salh", "Hawban"] },
    ],
  },
  {
    id: 13,
    code: "PS",
    name: "Palestine",
    dialCode: "+970",
    cities: [
      { id: 1301, name: "Gaza", regions: ["Rimal", "Shejaiya", "Zeitoun", "Tal Al Hawa"] },
      { id: 1302, name: "Ramallah", regions: ["Al Tireh", "Ein Misbah", "Al Masyoun", "Beitunia"] },
      { id: 1303, name: "Nablus", regions: ["Rafidia", "Old City", "Al Makhfiyah", "Balata"] },
    ],
  },
  {
    id: 14,
    code: "IR",
    name: "Iran",
    dialCode: "+98",
    cities: [
      { id: 1401, name: "Tehran", regions: ["Tajrish", "Vanak", "Shahrak-e Gharb", "Saadat Abad"] },
      { id: 1402, name: "Mashhad", regions: ["Sajjad", "Vakilabad", "Ahmadabad", "Torghabeh"] },
      { id: 1403, name: "Isfahan", regions: ["Jolfa", "Sepahan Shahr", "Mardavij", "Nazar"] },
    ],
  },
  {
    id: 15,
    code: "TR",
    name: "Turkey",
    dialCode: "+90",
    cities: [
      { id: 1501, name: "Istanbul", regions: ["Besiktas", "Kadikoy", "Sisli", "Uskudar"] },
      { id: 1502, name: "Ankara", regions: ["Cankaya", "Kecioren", "Yenimahalle", "Etimesgut"] },
      { id: 1503, name: "Izmir", regions: ["Konak", "Karsiyaka", "Bornova", "Buca"] },
    ],
  },
  {
    id: 16,
    code: "IL",
    name: "Israel",
    dialCode: "+972",
    cities: [
      { id: 1601, name: "Jerusalem", regions: ["City Center", "Talpiot", "Gilo", "Pisgat Ze'ev"] },
      { id: 1602, name: "Tel Aviv", regions: ["Jaffa", "Ramat Aviv", "Florentin", "Neve Tzedek"] },
      { id: 1603, name: "Haifa", regions: ["Hadar", "Carmel Center", "Bat Galim", "Neve Shaanan"] },
    ],
  },
];

module.exports = locationSeedData;
