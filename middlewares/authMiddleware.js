// middlewares/authMiddleware.js

const authMiddleware = (req, res, next) => {

  if (!req.session || !req.session.user) {
    return res.redirect('/'); // redirect to landing if not logged in
  }

  next();
};

module.exports = authMiddleware;