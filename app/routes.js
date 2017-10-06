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
  // request, response, next function
  function(req, res, next) {
    // if signup button is pressed, redirect to signup page
    if(req.body.signupButton) res.redirect('/signup');
    else next();
    // authenticate the login using passport
  }, passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // signup form
  app.get('/signup', function(req, res) {
    // render the signup page
    res.render('signup.pug', { message: req.flash('signupMessage') });
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
    User.findOneAndUpdate(
      { 'local.username': req.user.local.username },
      function(err, user) {
        if (err) {
          console.log(err);
          return done(err);
        }
        for(var i = 0; i < user.jobs.length; i++) {
          if (user.jobs[i].website == req.body.joblink) {
            console.log('already applied');
            console.log(req.body);
            return;
          }
        }
      },
      { $push: { 'jobs':{'website': req.body.joblink } } },
      { returnNewDocument: true },
      function(err, user) {
        console.log('hello, adding job....');

        // if there are any errors, return the error
        if (err) {
          console.log(err);
          return done(err);
        }

        //reload page
        res.redirect('/profile');
        return;
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
