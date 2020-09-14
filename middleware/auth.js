const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  //Check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'Access Denied: No Token Found' });
  }
  try {
    const decoded = jwt.verify(token, config.get('jwtToken'));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Access Denied: Token is not valid' });
    console.log(err.message);
  }
};
