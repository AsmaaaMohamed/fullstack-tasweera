const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../models/userModel');
const Story = require('../models/storyModel');
const storySeedData = require('../data/storySeedData');

dotenv.config({ path: './.env' });

const databaseUrl = process.env.DATABASE?.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

const buildStoryDocuments = artists => {
  const now = Date.now();

  return artists.flatMap((artist, artistIndex) => {
    const firstStory = storySeedData[artistIndex % storySeedData.length];
    const secondStory = storySeedData[(artistIndex + 1) % storySeedData.length];

    return [firstStory, secondStory].map((story, storyIndex) => ({
      artist: artist._id,
      media_url: story.media_url,
      type: story.type,
      caption: `${story.caption} (${artist.name})`,
      expires_at: new Date(now + (storyIndex + 1) * 24 * 60 * 60 * 1000),
      views_count: 0,
    }));
  });
};

const seedStories = async () => {
  if (!databaseUrl) {
    throw new Error('DATABASE connection string is missing');
  }

  await mongoose.connect(databaseUrl);
  console.log('DB connection successful');

  const artists = await User.find({ role: 'artist' }).select({ _id: 1, name: 1 }).lean();

  if (!artists.length) {
    throw new Error('No artist users found. Create artist accounts before seeding stories.');
  }

  const stories = buildStoryDocuments(artists);

  await Story.deleteMany({});
  await Story.insertMany(stories);

  console.log(`Seeded ${stories.length} stories for ${artists.length} artists`);
};

seedStories()
  .then(async () => {
    await mongoose.disconnect();
    console.log('Story seeding complete');
    process.exit(0);
  })
  .catch(async error => {
    console.error('Story seeding failed:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
