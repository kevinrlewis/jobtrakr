// ROUTES
// ==============================================
// load up the user model
var User = require('../app/models/user');

module.exports = function(app, passport) {

  //home page
  app.get('/', function(req, res) {
    res.render('index.pug', { title: 'JobTrak' });
  });

  // login form
  app.get('/login', function(req, res) {
    res.render('login.pug', { message: req.flash('loginMessage') });
  });

  // process login
  // post
  app.post('/login',
  function(req, res, next) {
    if(req.body.signupButton) res.redirect('/signup');
    else next();
  }, passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // signup form
  app.get('/signup', function(req, res) {
    res.render('signup.pug', { message: req.flash('signupMesage') });
  });

  // process signup
  // post
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  // user page
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('user.pug', {
      user : req.user
    });
  });

  // process adding a job
  app.post('/profile', isLoggedIn, function(req, res) {
    console.log(req.body);
    User.findOneAndUpdate(
      { 'local.username': req.user.local.username },
      { $push: { 'jobs':{'website': req.body.joblink } } },
      { returnNewDocument: true },
      function(err, user) {

        // if there are any errors, return the error
        if (err) {
          console.log(err);
          return done(err);
        }
    });
  })

  // logout page
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
}

// middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
