// ROUTES
// ==============================================
// load up the user model
var User = require('../app/models/user');
var userScript = require('../public/scripts/user');
var request = require('request');

module.exports = function(app, passport) {

  //home page
  app.get('/', function(req, res) {
    res.render('index.pug', { title: 'jobtrakr' });
  });

  // login form
  app.get('/login', function(req, res) {
    res.render('login.pug', { message: req.flash('loginMessage'), title: 'jobtrakr' });
  });

  // process login
  app.post('/login',
  // request, response, next function
  function(req, res, next) {
    // if signup button is pressed, redirect to signup page
    if(req.body.signupButton) res.redirect('/signup');
    else next();
    // authenticate the login using passport
  },
  passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  // signup form
  app.get('/signup', function(req, res) {
    // render the signup page
    res.render('signup.pug', { message: req.flash('signupMessage'), title: 'jobtrakr' });
  });

  // attempt signup
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  // user page
  app.get('/profile', isLoggedIn, function(req, res) {
    request('https://api.tronalddump.io/random/quote', function(error, response, body) {
      var obj = JSON.parse(body);
      //console.log(req.user.jobs);
      res.render('user.pug', {
        user : req.user,
        title: 'jobtrakr',
        appliedsum : (req.user.jobs.length),
        prospectivesum : (req.user.prospectjobs.length),
        rejectedsum : (req.user.rejectjobs.length),
        quote: obj.value
      });
    });
  });

  // process adding a job
  app.post('/add', isLoggedIn,
  function(req, res, next) {
    console.log("checking if job exists...");
    // job exists middle ware
    if(jobExists(req.user.jobs, req.body.joblink) || jobExists(req.user.prospectjobs, req.body.joblink)) {
      console.log("job exists, sending 500 error");
      // send response
      res.status(500).send('Job already exists.');
      return;
    }
    next();
  },
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
      'comments': req.body.comments,
      'company': req.body.company
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

  // process adding a job
  app.post('/addprospect', isLoggedIn,
  function(req, res, next) {
    console.log("in /add prospect, adding prospect");
    console.log("checking if job exists...");
    // job exists middle ware
    if(jobExists(req.user.jobs, req.body.joblink) || jobExists(req.user.prospectjobs, req.body.joblink)) {
      console.log("job exists, sending 500 error");
      // send response
      res.status(500).send('Job already exists.');
      return;
    }
    next();
  },
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
      'comments': req.body.comments,
      'company': req.body.company
    };
    // mongoose find one and update
    User.findOneAndUpdate(
      { 'local.username': req.user.local.username },
      { $push: { 'prospectjobs':jobObject } },
      { upsert: true },
      function(err, user) {
        // if there are any errors, return the error
        if (err) {
          console.log(err);
        }
        // create response
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
    var jobsarray;
    if(req.query.index) {
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
    } else if(req.query.prospect) {
      jobsarray = req.user.prospectjobs;
      jobsarray.splice(req.query.prospect, 1);

      // mongoose find one and update for removing job
      User.findOneAndUpdate(
        { 'local.username': req.user.local.username },
        { 'prospectjobs': jobsarray },
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
    } else if(req.query.reject) {
      jobsarray = req.user.rejectjobs;
      jobsarray.splice(req.query.reject, 1);
      // mongoose find one and update for removing job
      User.findOneAndUpdate(
        { 'local.username': req.user.local.username },
        { 'rejectjobs': jobsarray },
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
    }
  });

  // process adding a job
  app.post('/move', isLoggedIn,
  function(req, res, next) {
    if(req.query.prospect) {
      var jobsarray;
      var prospectarray;
      var movingobject;

      jobsarray = req.user.jobs;
      prospectarray = req.user.prospectjobs;

      // object to move to jobsarray
      movingobject = prospectarray[req.query.prospect];

      // remove object from prospect array
      prospectarray.splice(req.query.prospect, 1);

      // add object to jobs array
      jobsarray.push(movingobject);

      // mongoose find one and update
      User.findOneAndUpdate(
        { 'local.username': req.user.local.username },
        { 'jobs': jobsarray, 'prospectjobs': prospectarray },
        { upsert: true },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            console.log(err);
          }

          // send response
          res.redirect('/profile');
          return;
        });
    } else if(req.query.reject) {
      var jobsarray;
      var rejectsarray;
      var movingobject;

      jobsarray = req.user.jobs;
      rejectsarray = req.user.rejectjobs;

      // object to move to jobsarray
      movingobject = jobsarray[req.query.reject];

      // remove object from prospect array
      jobsarray.splice(req.query.reject, 1);

      // add object to jobs array
      rejectsarray.push(movingobject);

      // mongoose find one and update
      User.findOneAndUpdate(
        { 'local.username': req.user.local.username },
        { 'jobs': jobsarray, 'rejectjobs': rejectsarray },
        { upsert: true },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            console.log(err);
          }

          // send response
          res.redirect('/profile');
          return;
        });
    }
  });

  // logout page
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // TODO: create post for interviews
  // attempt to add interview to job
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

function jobExists(array, link) {
  // loop through jobs
  for(var i = 0; i < array.length; i++) {
    // if job link exists in jobs array
    if(array[i].website === link) {
      return true;
    }
  }
  return false;
}
