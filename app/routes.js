// ROUTES
// ==============================================
// load up the user model
var User = require('../app/models/user');
var userScript = require('../public/scripts/user');

module.exports = function(app, passport) {

  //home page
  app.get('/', function(req, res) {
    res.render('index.pug', { title: 'JobTrakr' });
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
  app.post('/add', isLoggedIn,
  function(req, res, next) {
    console.log("checking if job exists...");
    // job exists middle ware
    // loop through jobs
    for(var i = 0; i < req.user.jobs.length; i++) {
      // if job link exists in jobs array
      if(req.user.jobs[i].website === req.body.joblink) {
        console.log("job exists, sending 500 error");

        // send response
        res.status(500).send('Job already exists.');
        return;
      }
    }
    next();
  },
  /*function(req, res, next) {
    console.log("validating url...");
    if(validUrl.isUri(req.body.joblink)) {
      next();
    } else {
      console.log("invalid url");
      res.status(500).send('Invalid URL.');
      return;
    }
  },*/
  function(req, res, next) {
    console.log("adding job...");
    // job add middleware
    // process adding a job if the link does not exist yet
    // job object to add to mongodb
    var jobObject = {
      'website': req.body.joblink,
      'date': calcDate(),
      'hostname': req.body.hostname,
      'hash': req.body.hash,
      'pathname': req.body.pathname,
      'search': req.body.search,
      'comments': req.body.comments
    };
    // mongoose find one and update
    User.findOneAndUpdate(
      { 'local.username': req.user.local.username },
      { $push: { 'jobs':jobObject } },
      { upsert: true },
      function(err, user) {
        // if there are any errors, return the error
        if (err) {
          console.log(err);
        }

        var response = {
            status  : 200,
            success : 'Updated Successfully'
        };
        // send response
        res.end(JSON.stringify(response));
      });
  });

  // process removing a job
  app.post('/remove', isLoggedIn, function(req, res) {
    jobsarray = req.user.jobs;
    jobsarray.splice(req.query.index, 1);

    // mongoose find one and update for removing job
    User.findOneAndUpdate(
      { 'local.username': req.user.local.username },
      { 'jobs': jobsarray },
      function(err, user) {
        // if there are any errors, return the error
        if (err) {
          console.log(err);
          return done(err);
        }

        //reload page
        res.redirect('/profile');
        return;
      });
  });

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

// calculate the Date
function calcDate() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10){
    dd = '0' + dd;
  }
  if (mm < 10){
    mm = '0' + mm;
  }
  var today = mm + '/' + dd + '/' + yyyy;
  return today;
}
