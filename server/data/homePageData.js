const homePageContent = {
  ar: {
    message: 'تم استرداد بيانات الصفحة الرئيسية (البنرات وأفضل المصورين) بنجاح.',
    banners: [
      {
        id: 1,
        title: 'التقط اللحظة، اصنع الذكرى.',
        image_url:
          'https://taswera.computinggate.com/storage/banners/ujuBAebphuUvIvfPrxulxSlofbTdbil2YRF9Q2xR.jpg',
        created_at: '2025-08-07 11:05:29',
        updated_at: '2025-08-12 15:15:24',
      },
      {
        id: 2,
        title: 'قصتك في صورة.',
        image_url:
          'https://taswera.computinggate.com/storage/banners/ATBKWPaE3TnfIXJAlqDeeAxK6eLXt5Tj4LTXviuY.jpg',
        created_at: '2025-08-07 11:06:32',
        updated_at: '2025-08-07 11:06:32',
      },
      {
        id: 3,
        title: 'نحول اللحظات إلى فن.',
        image_url:
          'https://taswera.computinggate.com/storage/banners/HC7SSOlOUnazym6jiJj739XWL7YrgSzu9mys0c4A.jpg',
        created_at: '2025-08-07 11:09:33',
        updated_at: '2025-08-07 11:09:33',
      },
    ],
    categories: [
      {
        id: 1,
        name: 'تصوير بورتريه',
        image_url:
          'https://taswera.computinggate.com/storage/sections/4F0sA61DcUKwZNfKgTH1TorTBeHV5ahL3yD6sxLw.jpg',
      },
      {
        id: 2,
        name: 'تصوير طبيعة',
        image_url:
          'https://taswera.computinggate.com/storage/sections/9G6YaF36fR5SKr428nc9C74PIWbzyx7GXVAA49vD.jpg',
      },
      {
        id: 3,
        name: 'تصوير معماري',
        image_url:
          'https://taswera.computinggate.com/storage/sections/OtsTXXSzV6zSIGArIEGUbO04vWvGxnG8F6qGi4Au.jpg',
      },
      {
        id: 4,
        name: 'تصوير منتجات',
        image_url:
          'https://taswera.computinggate.com/storage/sections/2Yd9yvhMgDmwEfFThTVNdXilnkF243wg0kbXDWpu.jpg',
      },
      {
        id: 5,
        name: 'تصوير أزياء',
        image_url:
          'https://taswera.computinggate.com/storage/sections/ORf7sYLqtMhwmqS5xzDjI9kliE4HHz9k6gNW4r26.jpg',
      },
    ],
  },
  en: {
    message: 'Home page data (banners and top photographers) was retrieved successfully.',
    banners: [
      {
        id: 1,
        title: 'Capture the moment, make the memory.',
        image_url:
          'https://taswera.computinggate.com/storage/banners/ujuBAebphuUvIvfPrxulxSlofbTdbil2YRF9Q2xR.jpg',
        created_at: '2025-08-07 11:05:29',
        updated_at: '2025-08-12 15:15:24',
      },
      {
        id: 2,
        title: 'Your story in one frame.',
        image_url:
          'https://taswera.computinggate.com/storage/banners/ATBKWPaE3TnfIXJAlqDeeAxK6eLXt5Tj4LTXviuY.jpg',
        created_at: '2025-08-07 11:06:32',
        updated_at: '2025-08-07 11:06:32',
      },
      {
        id: 3,
        title: 'We turn moments into art.',
        image_url:
          'https://taswera.computinggate.com/storage/banners/HC7SSOlOUnazym6jiJj739XWL7YrgSzu9mys0c4A.jpg',
        created_at: '2025-08-07 11:09:33',
        updated_at: '2025-08-07 11:09:33',
      },
    ],
    categories: [
      {
        id: 1,
        name: 'Portrait Photography',
        image_url:
          'https://taswera.computinggate.com/storage/sections/4F0sA61DcUKwZNfKgTH1TorTBeHV5ahL3yD6sxLw.jpg',
      },
      {
        id: 2,
        name: 'Nature Photography',
        image_url:
          'https://taswera.computinggate.com/storage/sections/9G6YaF36fR5SKr428nc9C74PIWbzyx7GXVAA49vD.jpg',
      },
      {
        id: 3,
        name: 'Architectural Photography',
        image_url:
          'https://taswera.computinggate.com/storage/sections/OtsTXXSzV6zSIGArIEGUbO04vWvGxnG8F6qGi4Au.jpg',
      },
      {
        id: 4,
        name: 'Product Photography',
        image_url:
          'https://taswera.computinggate.com/storage/sections/2Yd9yvhMgDmwEfFThTVNdXilnkF243wg0kbXDWpu.jpg',
      },
      {
        id: 5,
        name: 'Fashion Photography',
        image_url:
          'https://taswera.computinggate.com/storage/sections/ORf7sYLqtMhwmqS5xzDjI9kliE4HHz9k6gNW4r26.jpg',
      },
    ],
  },
};

const fallbackTopPhotographers = [
  {
    id: 1001,
    name: 'Taswera Artist One',
    profile_picture_url: null,
    average_rating: '5.00',
    ratings_count: 0,
    years_of_experience: 5,
    has_active_story: false,
  },
  {
    id: 1002,
    name: 'Taswera Artist Two',
    profile_picture_url: null,
    average_rating: '4.50',
    ratings_count: 0,
    years_of_experience: 4,
    has_active_story: false,
  },
  {
    id: 1003,
    name: 'Taswera Artist Three',
    profile_picture_url: null,
    average_rating: '4.00',
    ratings_count: 0,
    years_of_experience: 3,
    has_active_story: false,
  },
];

const storyMediaLibrary = [
  {
    media_url:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
  {
    media_url:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
  {
    media_url:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
  {
    media_url:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
  {
    media_url:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
  {
    media_url:
      'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=900&q=80',
    type: 'image',
  },
];

module.exports = {
  homePageContent,
  fallbackTopPhotographers,
  storyMediaLibrary,
};
