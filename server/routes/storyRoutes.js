const express = require('express');

const authController = require('../controllers/authController');
const storyController = require('../controllers/storyController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo('artist'));

router.get('/', storyController.getMyStories);
router.post('/', storyController.createStory);
router.patch('/:storyId', storyController.updateStory);
router.delete('/:storyId', storyController.deleteStory);

module.exports = router;
