var express = require('express');
var loginRouter = express.Router();

loginRouter.route('/').post((req, res, next) => {
  res.statusCode = 201;
  res.setHeader('Content-Type', 'application/json');
  res.send('user logged in successfully');
});

module.exports = loginRouter;
