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
var debug         = require('debug')('routes');

var webtitle      = "Job Tracker";

module.exports = function(app, passport) {

  // home page
  app.get('/', function(req, res) {
    debug('GET /');
    res.render('index.pug', { title: webtitle });
  });

  // about page
  app.get('/about', function(req, res) {
    debug('GET /about');
    res.render('about.pug', { title: webtitle });
  });

  // login form
  app.get('/login', function(req, res) {
    debug('GET /login');
    var emailback = '';
    res.render('login.pug', { message: req.flash('loginMessage'), title: webtitle, email: req.flash('email')[0] });
  });

  // process login
  app.post('/login',
  // request, response, next function
  function(req, res, next) {
    debug('POST /login');
    debug(req);
    // if signup button is pressed, redirect to signup page
    if(req.body.signupButton) {
      res.render('signup.pug', { title: webtitle });
    }
    // if both the email and password fields are empty
    else if(req.body.email === '' && req.body.password === '') {
      res.render('login.pug', { message: 'Please enter an e-mail and password.', title: webtitle });
    }
    // if the email field is empty but password has input
    else if(req.body.email === '') {
      res.render('login.pug', { message: 'Please enter an e-mail.', title: webtitle });
    }
    // if the password field is empty but email has input
    else if(req.body.password === '') {
      res.render('login.pug', { message: 'Please enter a password.', title: webtitle, email: req.body.email });
    }
    // form is completely filled
    else {
      debug('validation passed. continuing to passport for authentication...')
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
    debug('GET /signup');
    // render the signup page
    res.render('signup.pug', { message: req.flash('signupMessage'), title: webtitle });
  });

  // forgot password
  app.get('/forgot', function(req, res) {
    debug('GET /forgot');
    if(req.session.flash.error != undefined) {
      res.render('forgot.pug', { messageError: req.session.flash.error[0], title: webtitle });
    } else if(req.session.flash.info != undefined) {
      res.render('forgot.pug', { messageInfo: req.session.flash.info[0], title: webtitle });
    } else {
      res.render('forgot.pug', { title: webtitle });
    }

  });

  // forgot password submit
  app.post('/forgot', function(req, res, next) {
    debug('POST /forgot');
    // waterfall asynchronous
    asynchro.waterfall([
      function(done) {
        // generate random token
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      // find user and assign the token to them with an expiration time
      function(token, done) {
        User.findOne({ 'local.email': req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }

          // set the token and expiration
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      // email functionality, for password reset request
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
          subject: 'Jobtrakr Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        // send the mail
        nodemailerMailgun.sendMail(mailOptions, function(err) {
          req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if(err) {
        debug(err);
        return next(err);
      }
      res.redirect('/forgot');
    });
  });

  // reset password dependent on token
  app.get('/reset/:token', function(req, res) {
    debug('GET /reset/:token');
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
    debug('POST /reset/:token');
    // asynchronous waterfall
    asynchro.waterfall([
      // find the user with the token
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }

          // set the new password, clear the token and expiration
          user.local.password = user.generateHash(req.body.password);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          // save the user
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
      // authentication for mail
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
          subject: 'Jobtrakr: Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your jobtrakr account ' + user.local.email + ' has just been changed.\n'
        };
        // send the success email
        nodemailerMailgun.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/login');
    });
  });

  // attempt signup
  app.post('/signup',
  // middleware function to validate input
  function(req, res, next) {
    debug('POST /signup');
    debug(req);
    // regex to validate email
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // if the firstname field and the email field are not filled
    if((req.body.firstname === '') && (req.body.email === '')) {
      res.render('signup.pug', { message: 'Please enter both an e-mail and your first name.', title: webtitle });
    }
    // if the firstname field is not filled
    else if(req.body.firstname === '') {
      res.render('signup.pug', { message: 'Please enter your first name.', title: webtitle, email: req.body.email });
    }
    // if the email field is not filled
    else if(req.body.email === '') {
      res.render('signup.pug', { message: 'Please enter an e-mail.', title: webtitle, name: req.body.firstname });
    }
    // if the email is not a valid email
    else if(!(re.test(req.body.email))) {
      res.render('signup.pug', { message: 'Please enter a VALID e-mail.', title: webtitle, name: req.body.firstname });
    }
    // if one or both of the password fields are empty
    else if((req.body.password === '') || (req.body.confirmpassword === '')) {
      res.render('signup.pug', { message: 'Please enter a password.', title: webtitle, email: req.body.email, name: req.body.firstname });
    }
    // if the passwords do not match
    else if(req.body.password != req.body.confirmpassword) {
      res.render('signup.pug', { message: 'Confirmation password does not match entered password.', title: webtitle, email: req.body.email, name: req.body.firstname });
    }
    // if the password length does not meet the requirements
    else if(req.body.password.length < 7) {
      res.render('signup.pug', { message: 'Password does not meet length requirements.', title: webtitle, email: req.body.email, name: req.body.firstname});
    }
    // if the password does not contain a number
    else if((!/\d/.test(req.body.password))) {
      res.render('signup.pug', { message: 'Password must contain a number.', title: webtitle, email: req.body.email, name: req.body.firstname });
    }
    // sign was successful, continue to passport for signing up
    else {
      debug('signup attempt form successful...');
      next();
    }
  },
  passport.authenticate('local-signup', {
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
  }));

  // user page
  app.get('/profile',
  isLoggedIn,
  function(req, res, next) {
    debug('GET /profile');
    // var url = "https://jobs.github.com/positions.json?description=python&location=new+york"
    var url = "https://jobs.github.com/positions.json"
    // //generate random jobs
    // if(req.user.jobs.length != 0) {
    //   // generate jobs based on already applied jobs
    //   debug('changing url...');
    //   var searchterm = req.user.jobs[0].jobtitle;
    //   url = url + "?description=" + searchterm;
    // } else if(req.user.prospectjobs.length != 0){
    //   debug('changing url...');
    //   var searchterm = req.user.prospectjobs[0].jobtitle;
    //   url = url + "?description=" + searchterm;
    // } else if(req.user.interviewingjobs.length != 0) {
    //   debug('changing url...');
    //   var searchterm = req.user.interviewingjobs[0].jobtitle;
    //   url = url + "?description=" + searchterm;
    // } else if(req.user.rejectjobs.length != 0) {
    //   debug('changing url...');
    //   var searchterm = req.user.rejectjobs[0].jobtitle;
    //   url = url + "?description=" + searchterm;
    // }

    debug('request url: ' + url);
    request(url, function(error, response, body) {
      if(error) {
        debug(error);
        return;
      }

      // display random jobs from github jobs api
      var ghjobsarray = [];
      var temp = JSON.parse(body);
      var i;
      var temparr = [];
      for(i = 0; i < 4; i++) {
        // generate random number
        var rand = Math.floor(Math.random() * (temp.length+1));
        // if random number was chosen already, pick a new random number
        while(temparr.includes(rand)) {
          rand = Math.floor(Math.random() * (temp.length+1));
        }
        // push to array to track which numbers have been used
        temparr.push(rand);
        // push job to array
        ghjobsarray.push(temp[rand]);
      }

      // render page
      var totalinterviews = 0;
      req.user.interviewingjobs.forEach(function(job) {
        totalinterviews += job.interviews.length;
      });
      res.render('user.pug', {
        user : req.user,
        title: webtitle,
        appliedsum : (req.user.jobs.length),
        prospectivesum : (req.user.prospectjobs.length),
        rejectedsum : (req.user.rejectjobs.length),
        interviewingsum: (req.user.interviewingjobs.length),
        totalinterviews: totalinterviews,
        githubarray: ghjobsarray
      });
    });
    //next();
  });

  // get github jobs
  app.get('/ghjobs', isLoggedIn, function(req, res) {
    debug('GET ghjobs');

  });

  // route for prospective jobs of the user
  app.get('/prospective', isLoggedIn, function(req, res) {
    debug('GET /prospective');
    res.render('prospective.pug', { user: req.user, title: webtitle, prospectivesum : (req.user.prospectjobs.length),
      appliedsum : (req.user.jobs.length),
      prospectivesum : (req.user.prospectjobs.length),
      rejectedsum : (req.user.rejectjobs.length),
      interviewingsum: (req.user.interviewingjobs.length) });
  });

  // process adding a job
  app.post('/prospective', isLoggedIn,
  function(req, res, next) {
    debug('POST /prospective');
    debug("in /add prospect, adding prospect");
    debug("checking if job exists...");
    // job exists middle ware
    debug("job exists in applied jobs: " + jobExists(req.user.jobs, req.body.joblink));
    debug("job exists in prospective jobs: " + jobExists(req.user.prospectjobs, req.body.joblink));
    debug("job exists in interviewing jobs: " + jobExists(req.user.interviewingjobs, req.body.joblink));
    debug("job exists in reject jobs: " + jobExists(req.user.rejectjobs, req.body.joblink));
    if(jobExists(req.user.jobs, req.body.joblink)
    || jobExists(req.user.prospectjobs, req.body.joblink)
    || jobExists(req.user.interviewingjobs, req.body.joblink)
    || jobExists(req.user.rejectjobs, req.user.joblink)) {
      debug("job exists, sending 500 error");
      // send response
      res.status(500).send('Job already exists.');
      return;
    }
    next();
  },
  function(req, res, next) {
    debug("adding job...");
    debug(req.body);
    // handle urls with out protocols
    var link = req.body.joblink;
    if(link.substring(0, 5).toLowerCase() !== "http:" && link.substring(0, 6).toLowerCase() !== "https:") {
      link = "http://" + link;
    }

    debug(link);

    // job add middleware
    // process adding a job if the link does not exist yet
    // job object to add to mongodb
    var jobObject = {
      'website': link,
      'comments': req.body.comments,
      'company': req.body.company,
      'jobtitle': req.body.jobtitle,
      'interviews': [],
      'date': calcDate()
    };
    // mongoose find one and update
    User.findOneAndUpdate(
      { 'local.email': req.user.local.email },
      { $push: { 'prospectjobs':jobObject } },
      { upsert: true },
      function(err, user) {
        // if there are any errors, return the error
        if (err) {
          debug(err);
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

  // route for applied jobs of the user
  app.get('/applied', isLoggedIn, function(req, res) {
    debug('GET /applied');
    res.render('applied.pug', { user: req.user, title: webtitle, appliedsum : (req.user.jobs.length),
      appliedsum : (req.user.jobs.length),
      prospectivesum : (req.user.prospectjobs.length),
      rejectedsum : (req.user.rejectjobs.length),
      interviewingsum: (req.user.interviewingjobs.length) });
  });

  // process adding a job
  app.post('/applied', isLoggedIn,
  function(req, res, next) {
    debug('POST /applied');
    debug("checking if job exists...");
    // job exists middle ware
    debug("job exists in applied jobs: " + jobExists(req.user.jobs, req.body.joblink));
    debug("job exists in prospective jobs: " + jobExists(req.user.prospectjobs, req.body.joblink));
    debug("job exists in interviewing jobs: " + jobExists(req.user.interviewingjobs, req.body.joblink));
    debug("job exists in reject jobs: " + jobExists(req.user.rejectjobs, req.body.joblink));
    if(jobExists(req.user.jobs, req.body.joblink)
    || jobExists(req.user.prospectjobs, req.body.joblink)
    || jobExists(req.user.interviewingjobs, req.body.joblink)
    || jobExists(req.user.rejectjobs, req.user.joblink)) {
      debug("job exists, sending 500 error");
      // send response
      res.status(500).send('Job already exists.');
      return;
    }
    next();
  },
  function(req, res, next) {
    debug("adding job...");

    // handle urls with out protocols
    var link = req.body.joblink;
    if(link.substring(0, 5).toLowerCase() !== "http:" && link.substring(0, 6).toLowerCase() !== "https:") {
      link = "http://" + link;
    }

    debug(link);

    // job add middleware
    // process adding a job if the link does not exist yet
    // job object to add to mongodb
    var jobObject = {
      'website': link,
      'comments': req.body.comments,
      'company': req.body.company,
      'jobtitle': req.body.jobtitle,
      'interviews': [],
      'date': calcDate()
    };
    // mongoose find one and update
    User.findOneAndUpdate(
      { 'local.email': req.user.local.email },
      { $push: { 'jobs':jobObject } },
      { upsert: true },
      function(err, user) {
        // if there are any errors, return the error
        if (err) {
          debug(err);
        }

        var response = {
            status  : 200,
            success : 'Updated Successfully'
        };
        // send response
        res.end(JSON.stringify(response));
      });
  });

  // route for interviews of the user
  app.get('/interviews', isLoggedIn, function(req, res) {
    debug('GET /interviews');
    res.render('interviews.pug', { user: req.user, title: webtitle, interviewingsum: (req.user.interviewingjobs.length),
      appliedsum : (req.user.jobs.length),
      prospectivesum : (req.user.prospectjobs.length),
      rejectedsum : (req.user.rejectjobs.length),
      interviewingsum: (req.user.interviewingjobs.length) });
  });

  // attempt to add interviews
  app.post('/interviews', isLoggedIn,
  function(req, res, next) {
    debug('POST /interviews');
    debug('interviewingjob to update...');
    // create the interview object to add
    var interviewObject = {
      'interviewDate': req.body.interviewDate,
      'interviewer': req.body.interviewer
    };

    // store variables
    var jobObject = req.user.interviewingjobs[req.body.interviewJobIndex];
    var interviews = jobObject.interviews;

    // update interviews array
    interviews.push(interviewObject);
    jobObject.interviews = interviews;

    // update the job with interviews array
    // mongoose find one and update
    User.findOneAndUpdate(
      { 'local.email': req.user.local.email },
      { $set: { 'interviewingjobs': jobObject } },
      { upsert: true },
      function(err, user) {
        // if there are any errors, return the error
        if (err) {
          debug(err);
        }

        var response = {
            status  : 200,
            success : 'Updated Successfully'
        };
        // send response
        res.end(JSON.stringify(response));
      }
    );
  });

  // route for rejected jobs of the user
  app.get('/rejected', isLoggedIn, function(req, res) {
    debug('GET /rejected');
    res.render('rejected.pug', { user: req.user, title: webtitle, rejectedsum : (req.user.rejectjobs.length),
      appliedsum : (req.user.jobs.length),
      prospectivesum : (req.user.prospectjobs.length),
      rejectedsum : (req.user.rejectjobs.length),
      interviewingsum: (req.user.interviewingjobs.length) });
  });

  // process removing a job
  app.post('/remove', isLoggedIn, function(req, res) {
    debug('POST /remove');
    var jobsarray;
    if(req.query.index) {
      jobsarray = req.user.jobs;
      jobsarray.splice(req.query.index, 1);

      // mongoose find one and update for removing job
      User.findOneAndUpdate(
        { 'local.email': req.user.local.email },
        { 'jobs': jobsarray },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            debug(err);
            return done(err);
          }

          //reload page
          res.redirect('/applied');
          return;
        });
    } else if(req.query.prospect) {
      jobsarray = req.user.prospectjobs;
      jobsarray.splice(req.query.prospect, 1);

      // mongoose find one and update for removing job
      User.findOneAndUpdate(
        { 'local.email': req.user.local.email },
        { 'prospectjobs': jobsarray },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            debug(err);
            return done(err);
          }

          //reload page
          res.redirect('/prospective');
          return;
        });
    } else if(req.query.reject) {
      jobsarray = req.user.rejectjobs;
      jobsarray.splice(req.query.reject, 1);
      // mongoose find one and update for removing job
      User.findOneAndUpdate(
        { 'local.email': req.user.local.email },
        { 'rejectjobs': jobsarray },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            debug(err);
            return done(err);
          }

          //reload page
          res.redirect('/rejected');
          return;
        });
    } else if(req.query.inter) {
      jobsarray = req.user.interviewingjobs;
      jobsarray.splice(req.query.inter, 1);
      // mongoose find one and update for removing job
      User.findOneAndUpdate(
        { 'local.email': req.user.local.email },
        { 'interviewingjobs': jobsarray },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            debug(err);
            return done(err);
          }

          //reload page
          res.redirect('/interviews');
          return;
        });
    }
  });

  // process adding a job
  app.post('/move', isLoggedIn,
  function(req, res, next) {
    debug('POST /move');
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
        { 'local.email': req.user.local.email },
        { 'jobs': jobsarray, 'prospectjobs': prospectarray },
        { upsert: true },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            debug(err);
          }

          // send response
          res.redirect('/applied');
          return;
        }
      );
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
        { 'local.email': req.user.local.email },
        { 'jobs': jobsarray, 'rejectjobs': rejectsarray },
        { upsert: true },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            debug(err);
          }

          // send response
          res.redirect('/rejected');
          return;
        }
      );
    } else if(req.query.inter) {
      var jobsarray;
      var interviewsarray;
      var movingobject;

      jobsarray = req.user.jobs;
      interviewsarray = req.user.interviewingjobs;

      // object to move to interviews array
      movingobject = jobsarray[req.query.inter];

      // remove object from jobsarray array
      jobsarray.splice(req.query.inter, 1);

      // add object to interviews array
      interviewsarray.push(movingobject);

      // mongoose find one and update
      User.findOneAndUpdate(
        { 'local.email': req.user.local.email },
        { 'jobs': jobsarray, 'interviewingjobs': interviewsarray },
        { upsert: true },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            debug(err);
          }

          // send response
          res.redirect('/interviews');
          return;
        }
      );
    } else if(req.query.interreject) {
      var interviewsarray;
      var rejectsarray;
      var movingobject;

      interviewsarray = req.user.interviewingjobs;
      rejectsarray = req.user.rejectjobs;

      // object to move to jobsarray
      movingobject = interviewsarray[req.query.interreject];

      // remove object from prospect array
      interviewsarray.splice(req.query.interreject, 1);

      // add object to jobs array
      rejectsarray.push(movingobject);

      // mongoose find one and update
      User.findOneAndUpdate(
        { 'local.email': req.user.local.email },
        { 'interviewingjobs': interviewsarray, 'rejectjobs': rejectsarray },
        { upsert: true },
        function(err, user) {
          // if there are any errors, return the error
          if (err) {
            debug(err);
          }

          // send response
          res.redirect('/rejected');
          return;
        }
      );
    }
  });

  // logout page
  app.get('/logout', function(req, res) {
    debug('GET /logout');
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
  var today = yyyy + '-' + mm + '-' + dd;
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
