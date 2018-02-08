// BASE SETUP
// ==============================================
// requires
var express       = require('express');
var port          = process.env.PORT || 3000;
var path          = require('path');
var mongoose      = require('mongoose');
var bodyParser    = require('body-parser');
var passport      = require('passport');
//var flash         = require('connect-flash');
var flash         = require('express-flash');
var bcrypt        = require('bcrypt-nodejs');
var session       = require('express-session');
var db            = require('../outer/database.js');
var sec           = require('../outer/session.js');
var helmet        = require('helmet');
var compression   = require('compression');
var debug         = require('debug')('server');
var favicon       = require('serve-favicon');
var nodemailer    = require('nodemailer');
var debug         = require('debug')('server');
var app           = express();

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// required for passport
app.use(session({
  secret: sec.secret,
  resave: true,
  saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(helmet());

// connect mongodb database
// TODO: Fix
try {
  mongoose.connect(db.url, { useMongoClient: true });
} catch (e) {
  debug("was unable to connect to database");
  debug(e.message);
  // handle or display that the database can't connect
}

// require the routes and passport files
require('./config/passport')(passport); // pass passport for configuration
require('./app/routes.js')(app, passport);

//handling
////////////////////////////////////////////////////////////////////////////////
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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


// START THE SERVER
// ==============================================
app.listen(port);
debug('Magic happens on port ' + port);
