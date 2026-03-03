// middlewares/authMiddleware.js

const authMiddleware = (req, res, next) => {
  if (!req.cookies.username) {
    return res.redirect('/'); // redirect to login
  }
  next();
};

module.exports = authMiddleware;