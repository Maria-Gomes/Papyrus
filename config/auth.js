module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.json({ error_msg: "Please login to view this page." });
  },
};
