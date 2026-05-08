module.exports = (req, res, next) => {
  req.user = { id: '00000000-0000-0000-0000-000000000000' }; // A mock user ID
  next();
};
