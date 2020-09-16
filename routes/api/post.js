const express = require('express');
const router = express.Router();
const Post = require('../../modles/Post');
const User = require('../../modles/User');
const Profile = require('../../modles/Profile');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
//@route     POST api/post
//@desc      Create Post
//@access    Private
router.post(
  '/',
  [auth, [check('text', 'Text is Required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();
      console.log('Post Added'.green);

      return res.json(post);
    } catch (err) {
      console.error(`${err.message}`.red);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
