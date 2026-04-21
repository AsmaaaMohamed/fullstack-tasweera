const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Story = require('../models/storyModel');
const {
  homePageContent,
  fallbackTopPhotographers,
} = require('../data/homePageData');

const normalizeLang = lang => (String(lang || 'ar').toLowerCase().startsWith('en') ? 'en' : 'ar');

const isStoryActive = story => new Date(story.expires_at).getTime() > Date.now();

const mapStory = story => ({
  id: String(story._id),
  media_url: story.media_url,
  type: story.type,
  caption: story.caption || '',
  expires_at: new Date(story.expires_at).toISOString(),
  created_at: new Date(story.created_at).toISOString(),
  views_count: story.views_count || 0,
  is_viewed: false,
});

const mapArtistToHomeCard = (artist, hasActiveStory = false) => ({
  id: artist._id,
  name: artist.name,
  profile_picture_url: artist.profile_picture_url || null,
  average_rating: artist.artistProfile?.average_rating || '0.00',
  ratings_count: artist.artistProfile?.ratings_count || 0,
  years_of_experience: artist.artistProfile?.years_of_experience || 0,
  has_active_story: hasActiveStory,
});

const buildStoryGroup = (artist, stories) => {
  if (!stories.length) {
    return null;
  }

  return {
    artist_id: String(artist._id),
    artist_name: artist.name,
    artist_profile_photo_url: artist.profile_picture_url || null,
    all_stories_viewed: false,
    stories: stories.map(mapStory),
  };
};

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

exports.getCustomerHome = catchAsync(async (req, res) => {
  const lang = normalizeLang(req.query.lang);
  const localizedContent = homePageContent[lang];

  const artists = await User.find({ role: 'artist' })
    .sort({ createdAt: -1 })
    .select({
      name: 1,
      profile_picture_url: 1,
      artistProfile: 1,
    })
    .limit(10);

  const activeStoryArtists = await Story.distinct('artist', {
    expires_at: { $gt: new Date() },
  });
  const activeStoryArtistIds = new Set(activeStoryArtists.map(id => String(id)));

  const topPhotographers = artists.length
    ? artists.map(artist => mapArtistToHomeCard(artist, activeStoryArtistIds.has(String(artist._id))))
    : fallbackTopPhotographers;

  res.status(200).json({
    status: 'success',
    message: localizedContent.message,
    data: {
      banners: localizedContent.banners,
      categories: localizedContent.categories,
      top_photographers: topPhotographers,
    },
  });
});

exports.getCustomerStories = catchAsync(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const perPage = toPositiveInt(req.query.per_page, 5);

  const artists = await User.find({ role: 'artist' })
    .sort({ createdAt: -1 })
    .select({
      name: 1,
      profile_picture_url: 1,
    });

  const activeStories = await Story.find({
    expires_at: { $gt: new Date() },
  })
    .sort({ created_at: -1 })
    .lean();

  const storiesByArtistId = activeStories.reduce((acc, story) => {
    const artistId = String(story.artist);
    if (!acc.has(artistId)) {
      acc.set(artistId, []);
    }
    acc.get(artistId).push(story);
    return acc;
  }, new Map());

  const storyGroups = artists
    .map(artist => buildStoryGroup(artist, storiesByArtistId.get(String(artist._id)) || []))
    .filter(Boolean);

  const total = storyGroups.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, lastPage);
  const startIndex = (currentPage - 1) * perPage;
  const pagedStories = storyGroups.slice(startIndex, startIndex + perPage);

  res.status(200).json({
    status: 'success',
    data: {
      stories: pagedStories,
      pagination: {
        current_page: currentPage,
        last_page: lastPage,
        per_page: perPage,
        total,
      },
    },
  });
});
