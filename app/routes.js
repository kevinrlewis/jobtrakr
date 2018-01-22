// ROUTES
// ==============================================
// load up the user model
var User          = require('../app/models/user');
var userScript    = require('../public/scripts/user');
var request       = require('request');
var asynchro      = require('async');
var crypto        = require('crypto');
var nodemailer    = require('nodemailer');
var sec           = require('../../outer/session.js');
var mg            = require('nodemailer-mailgun-transport');

module.exports = function(app, passport) {

  //home page
  app.get('/', function(req, res) {
    //console.log(req);
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
    if(req.body.signupButton) {
      res.redirect('/signup');
    }
    // if both the email and password fields are empty
    else if(req.body.email === '' && req.body.password === '') {
      res.render('login.pug', { message: 'Please enter an e-mail and password.', title: 'jobtrakr' });
    }
    // if the email field is empty but password has input
    else if(req.body.email === '') {
      res.render('login.pug', { message: 'Please enter an e-mail.', title: 'jobtrakr' });
    }
    // if the password field is empty but email has input
    else if(req.body.password === '') {
      res.render('login.pug', { message: 'Please enter a password.', title: 'jobtrakr' });
    }
    // form is completely filled
    else {
      next();
    }
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

  // forgot password
  app.get('/forgot', function(req, res) {
    if(req.flash('info').length === 1) {
      //console.log(req);
      // render the forgot password page
      res.render('forgot.pug', { message: req.flash('info'), title: 'jobtrakr' });
    } else {
      // render the forgot password page
      res.render('forgot.pug', { title: 'jobtrakr' });
    }

  });

  // forgot password submit
  app.post('/forgot', function(req, res, next) {
    asynchro.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ 'local.email': req.body.email }, function(err, user) {
          if (!user) {
            console.log('no account with that email address exists');
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        // authentication for mailgun api
        var auth = {
          auth: {
            api_key: sec.emailkey,
            domain: 'jobtrakr.kvnlws.xyz'
          }
        };
        var nodemailerMailgun = nodemailer.createTransport(mg(auth));
        // create the message
        var mailOptions = {
          to: user.local.email,
          from: 'jobtrakr.mail@jobtrakr.kvnlws.xyz',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        nodemailerMailgun.sendMail(mailOptions, function(err) {
          req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if(err) {
        console.log(err);
        return next(err);
      }
      res.redirect('/forgot');
    });
  });

  // reset password dependent on token
  app.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {
        user: req.user
      });
    });
  });

  // attempt to reset password
  app.post('/reset/:token', function(req, res) {
    asynchro.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }

          user.local.password = user.generateHash(req.body.password);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      function(user, done) {
        var auth = {
          auth: {
            api_key: sec.emailkey,
            domain: 'jobtrakr.kvnlws.xyz'
          }
        };
        var nodemailerMailgun = nodemailer.createTransport(mg(auth));
        var mailOptions = {
          to: user.local.email,
          from: 'jobtrakr.mail@jobtrakr.kvnlws.xyz',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
        };
        nodemailerMailgun.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/');
    });
  });


  // attempt signup
  app.post('/signup',
  // middleware function to validate input
  function(req, res, next) {
    // regex to validate email
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // if the firstname field and the email field are not filled
    if((req.body.firstname === '') && (req.body.email === '')) {
      res.render('signup.pug', { message: 'Please enter both an e-mail and your first name.', title: 'jobtrakr' });
    }
    // if the firstname field is not filled
    else if(req.body.firstname === '') {
      res.render('signup.pug', { message: 'Please enter your first name.', title: 'jobtrakr' });
    }
    // if the email field is not filled
    else if(req.body.email === '') {
      res.render('signup.pug', { message: 'Please enter an e-mail.', title: 'jobtrakr' });
    }
    // if the email is not a valid email
    else if(!(re.test(req.body.email))) {
      res.render('signup.pug', { message: 'Please enter an VALID e-mail.', title: 'jobtrakr' });
    }
    // if one or both of the password fields are empty
    else if((req.body.password === '') || (req.body.confirmpassword === '')) {
      res.render('signup.pug', { message: 'Please enter a password.', title: 'jobtrakr' });
    }
    // if the passwords do not match
    else if(req.body.password != req.body.confirmpassword) {
      res.render('signup.pug', { message: 'Confirmation password does not match entered password.', title: 'jobtrakr' });
    }
    // if the password length does not meet the requirements
    else if(req.body.password.length < 7) {
      res.render('signup.pug', { message: 'Password does not meet length requirements.', title: 'jobtrakr' });
    }
    // if the password does not contain a number
    else if((!/\d/.test(req.body.password))) {
      res.render('signup.pug', { message: 'Password must contain a number.', title: 'jobtrakr' });
    }
    // sign was successful, continue to passport for signing up
    else {
      console.log('attempt successful...');
      next();
    }
  },
  passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  // user page
  app.get('/profile', isLoggedIn, function(req, res) {
    request('https://api.tronalddump.io/random/quote', function(error, response, body) {
      var obj = JSON.parse(body);
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
