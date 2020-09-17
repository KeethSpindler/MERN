const express = require('express');
const router = express.Router();
const Post = require('../../modles/Post');
const User = require('../../modles/User');
const Profile = require('../../modles/Profile');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

//@route     GET api/post
//@desc      Get Post By ID
//@access    Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    const count = await Post.collection.countDocuments();
    return res.status(200).json({ count: count, posts: posts });
  } catch (err) {
    console.error(`${err.message}`.red);
    return res.status(500).send('Server Error');
  }
});

//@route     GET api/post/:id
//@desc      Get Post By ID
//@access    Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: 'Post Not Found' });
    return res.status(200).json(post);
  } catch (err) {
    if (err.kind == 'ObjectId') {
      console.error(`${err.message}`.red);
      return res.status(400).json({ msg: 'Post Not Found' });
    }
    console.error(`${err.message}`.red);
    return res.status(500).send('Server Error');
  }
});

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

      return res.status(201).json(post);
    } catch (err) {
      console.error(`${err.message}`.red);
      return res.status(500).send('Server Error');
    }
  }
);

//@route     POST api/post/comment/:id
//@desc      Create Comment on Post
//@access    Private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is Required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();
      console.log('Comment Added'.green);

      return res.status(201).json(post.comments);
    } catch (err) {
      console.error(`${err.message}`.red);
      return res.status(500).send('Server Error');
    }
  }
);

//@route     DELETE api/post/:id
//@desc      Delete Post
//@access    Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: 'Post Not Found' });

    // Check User
    if (post.user.toString() !== req.user.id) {
      console.log(post.user.toString() + '\n' + req.user.id);
      return res.status(401).json({ msg: 'User Not Authorized' });
    }
    await post.remove();
    console.log('Post Deleted'.green);
    return res.status(200).json({ msg: 'Post Deleted' });
  } catch (err) {
    if (err.kind == 'ObjectId') {
      console.error(`${err.message}`.red);
      return res.status(400).json({ msg: 'Post Not Found' });
    }
    console.error(`${err.message}`.red);
    return res.status(500).send('Server Error');
  }
});

//@route     DELETE api/post/comment/:id/:comment_id
//@desc      Delete Comment on Post
//@access    Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Pull Out Comment
    const comment = {
      payload: post.comments.find(
        (comment) => comment.id === req.params.comment_id
      ),
      index: post.comments
        .map((comment) => comment.id === req.params.comment_id)
        .indexOf(req.user.id),
    };
    if (!comment.payload)
      return res.status(404).json({ msg: 'Comment Not Found' });
    // Check User
    if (comment.payload.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'User Not Authorized' });

    post.comments.splice(comment.index, 1);
    post.save();
    console.log('Comment Deleted'.green);
    return res.status(200).json(post.comments);
  } catch (err) {
    console.error(`${err.message}`.red);
    return res.status(500).send('Server Error');
  }
});

//@route     PUT api/post/like/:id
//@desc      Like a Post
//@access    Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post Already Liked' });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    console.log('Post Liked'.green);
    return res.status(200).json(post.likes);
  } catch (err) {
    console.error(`${err.message}`.red);
    return res.status(500).send('Server Error');
  }
});

//@route     PUT api/post/like/:id
//@desc      Unlike a Post
//@access    Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length == 0
    ) {
      return res.status(400).json({ msg: 'Post Has Not Been Liked' });
    }

    // Get Remove Index
    const index = post.likes.map((like) =>
      like.user.toString().indexOf(req.user.id)
    );
    post.likes.splice(index, 1);
    await post.save();
    console.log('Post Unliked'.green);
    return res.status(200).json(post.likes);
  } catch (err) {
    console.error(`${err.message}`.red);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
