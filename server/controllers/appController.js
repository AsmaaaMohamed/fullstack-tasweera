const catchAsync = require('../utils/catchAsync');
const { appInfoByLang } = require('../data/appData');

exports.getAboutApp = catchAsync(async (req, res) => {
  const lang = req.query.lang || "en";
  const translatedContent = appInfoByLang[lang];

  res.status(200).json({
    status: 'success',
    message: translatedContent.message,
    data: {
      app_name: translatedContent.app_name,
      about_app: translatedContent.about_app,
      version: appInfoByLang.common.version,
      last_updated_at: appInfoByLang.common.last_updated_at,
      contact_info: appInfoByLang.common.contact_info,
    },
  });
});
