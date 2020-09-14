const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
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
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
