var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/loginRouter');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ credentials: true }));
app.options('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With'
  );
  res.send(200);
});
app.use(
  session({
    name: 'session-id',
    secret: '123-sharmi-123-libin',
    saveUninitialized: 'false',
    resave: 'false',
    store: new FileStore()
  })
);
function auth(req, res, next) {
  console.log('Print the session', req.session);
  if (!req.session.user) {
    var authHeader = req.headers.authorization;
    console.log('Incoming request header ==>', req.headers);
    console.log('Incoming Auth ==>', authHeader);
    if (!authHeader) {
      var err = new Error('you are not authenticated  Missing AuthHeader');
      res.setHeader('WWW-authenticate', 'Basic');
      err.status = 401;
      next(err);
      return;
    }
    console.log('checking split ===> ', authHeader.split(' ')[1]);
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':');
    console.log(
      'split =>',
      new Buffer.from(authHeader.split(' ')[1], 'base64').toString()
    );
    var user = auth[0];
    var password = auth[1];

    console.log('print User ID and pwd ==>', user, password);
    if (user === 'admin' && password === 'password') {
      req.session.user = 'admin';
      next();
    } else {
      var err = new Error('You are not authenticated User ID , Password');
      res.setHeader('WWW-authenticate', 'Basic');
      err.status = 401;
      next(err);
    }
  } else {
    console.log('in Else ===>', req.session.user);
    if (req.session.user === 'admin') {
      next();
    } else {
      var err = new Error('You are not authenticated');
      err.status = 401;
      next(err);
    }
  }
}
app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
