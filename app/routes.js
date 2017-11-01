// ROUTES
// ==============================================
// load up the user model
var User = require('../app/models/user');
var userScript = require('../public/scripts/user');

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

  // TODO: fix duplicate jobs
  // process adding a job
  app.post('/add', isLoggedIn, function(req, res) {
    console.log("-----------------------------------------");
    console.log("checking if job exists");
    var add;

    //console.log(req.user.jobs);
    console.log(req.query);
    add = true;
    // loop through jobs
    for(var i = 0; i < req.user.jobs.length; i++) {
      // if job link exists in jobs array
      if(req.user.jobs[i].website == req.query.link) {
        console.log("JOB EXISTS");
        //res.status(500).send();
        add = false;
        break;
      }
    }

    console.log("add: " + add);
    if(add) {
      console.log("-----------------------------------------");
      console.log("adding a job...");
      // job object to add to mongodb
      var jobObject = {'website': req.query.link, 'date': calcDate() };
      // mongoose find one and update
      User.findOneAndUpdate(
        { 'local.username': req.user.local.username },
        { $push: { 'jobs':jobObject } },
        { upsert: true },
        function(err, user) {
          console.log('hello, adding job....');

          // if there are any errors, return the error
          if (err) {
            console.log(err);
            return done(err);
          }
          //reload page
          //res.redirect('/profile');
          return;
        });
        console.log("-----------------------------------------");
    }
    res.redirect('/profile');
    });

    // process removing a job
    app.post('/remove', isLoggedIn, function(req, res) {
      console.log("-----------------------------------------");
      console.log('removing job...');
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
        console.log("-----------------------------------------");
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
