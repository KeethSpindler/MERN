const express = require('express');
const router = express.Router();
const colors = require('colors');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../modles/Profile');
const User = require('../../modles/User');

//@route     GET api/profile/me
//@desc      Get current user's profile
//@access    Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'No Profile Exists For This User' });
    }

    return res.status(200).json(profile);
  } catch (err) {
    console.error(`${err.message}`.red);
    res.status(500).send('Server Error');
  }
});

//@route     GET api/profile
//@desc      Get all profiles
//@access    Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(`${err.message}`.red);
    res.status(500).send('Sever Error');
  }
});

//@route     GET api/profile/user/:user_id
//@desc      Get profile by user ID
//@access    Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'Profile Not Found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(`${err.message}`.red);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile Not Found' });
    }
    res.status(500).send('Sever Error');
  }
});

//@route     POST api/profile
//@desc      Create/Update user profile
//@access    Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build Social Object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        console.log('Profile Updated'.green);
        return res.json(profile);
      }
      // Create
      profile = new Profile(profileFields);
      await profile.save();
      console.log('Profile Saved'.green);
      res.json(profile);
    } catch (err) {
      console.error(`${err.message}`.red);
      res.status(500).send('Server Error');
    }
  }
);

//@route     PUT api/profile/experience
//@desc      Add Profile Experience
//@access    Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      return res.json({ profile });
    } catch (err) {
      console.error(`${err.message}`.red);
      res.status(500).send('Sever Error');
    }
  }
);

//@route     DELETE api/profile
//@desc      Delete Profile, User & Posts
//@access    Private
router.delete('/', auth, async (req, res) => {
  try {
    // @todo - Remove User's Posts

    // Remove Profile
    await Profile.findOneAndDelete({ user: req.user.id });
    console.log('Profile Removed'.green);
    // Remove User
    await User.findOneAndDelete({ _id: req.user.id });
    console.log('User Removed'.green);

    res.status(200).json({ msg: 'User Successfully Deleted' });
  } catch (err) {
    console.error(`${err.message}`.red);
    res.status(500).send('Sever Error');
  }
});

module.exports = router;
