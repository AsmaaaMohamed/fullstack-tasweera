const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const User = require('../models/userModel');
const Story = require('../models/storyModel');

const databaseUrl = process.env.DATABASE?.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

if (!databaseUrl) {
  throw new Error('DATABASE environment variable is not configured.');
}

async function moveStoriesToCollection() {
  await mongoose.connect(databaseUrl);

  const artists = await User.find({
    role: 'artist',
    stories: { $exists: true, $ne: [] },
  }).lean();

  let insertedCount = 0;

  for (const artist of artists) {
    const stories = (artist.stories || []).map(story => ({
      artist: artist._id,
      media_url: story.media_url,
      type: story.type || 'image',
      caption: story.caption,
      expires_at: story.expires_at,
      views_count: story.views_count || 0,
      created_at: story.created_at,
      updated_at: story.updated_at,
    }));

    if (stories.length) {
      await Story.insertMany(stories, { ordered: false });
      insertedCount += stories.length;
    }
  }

  await User.updateMany({}, { $unset: { stories: '' } });

  console.log(`Moved ${insertedCount} stories into the stories collection.`);
  await mongoose.disconnect();
}

moveStoriesToCollection().catch(async error => {
  console.error('Failed to move stories to separate collection:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
