

app.route('/login')

// show the form (GET http://localhost:8080/login)
.get(function(req, res) {
  console.log('get login form');
  res.render('login', { title: 'Sign In' });
})

// process the form (POST http://localhost:8080/login)
.post(function(req, res) {
  console.log('processing the login form');
  db.collection('users').findOne({ 'username':req.body.username }, function(err, user) {
    if (err) return console.log(err);
    if(user) {
      //user exists
      console.log('user exists');
      //decrypt hash here
      //check if password matches stored password
      if(req.body.password == user.password) {
        console.log('login successful');
        res.redirect('/user/' + req.body.username);
      }
      //password does not match
      else {
        console.log('login failed');
        res.redirect('/login');
      }
    }
    //user does not exist in db
    else {
      console.log('user not in database');
      res.redirect('/signup');
    }
  });
});

function signupPressed(req, res, next) {
  res.redirect('/signup');
}

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// sample route with a route the way we're used to seeing it
app.route('/signup')

//display signup form
.get(function(req, res) {
  console.log('get signup form');
  res.render('signup', { title: 'Sign-up' });
})

//process signup form
.post(function(req, res) {
  console.log('post signup form');
  db.collection('users').findOne( { 'username': req.body.username}, function (err, user){
    console.log(user);
    //user exists
    if(user){
      console.log('user exists: ' + req.body.username);
      res.redirect('/signup');
    } else {
      //save new user to database
      db.collection('users').save({ 'username':req.body.username, 'password':req.body.password }, (err, result) => {
        if (err) return console.log(err);
        console.log('saved to database');
        //navigate back to login page
        res.redirect('/login');
      });
    }
  });
});

// we'll create our routes here
// get an instance of router
var router = express.Router();

// route middleware that will happen on every request
router.use(function(req, res, next) {

    // log each request to the console
    console.log(req.method, req.url);

    // continue doing what we were doing and go to the route
    next();
});

// home page route (http://localhost:8080)
router.get('/', function(req, res) {
    //res.send('im the home page!');
    res.redirect('/login');
});

// route middleware to validate :name
router.param('name', function(req, res, next, name) {
    // do validation on name here
    // blah blah validation
    // log something so we know its working
    console.log('doing name validations on ' + name);

    // once validation is done save the new item in the req
    req.name = name;
    // go to the next thing
    next();
});

// route with parameters (http://localhost:8080/hello/:name)
router.get('/user/:name', function(req, res) {
  var jobs;
  db.collection('users').findOne( { 'username': req.name}, function (err, user){
    //console.log(user);
    res.render('user', { title: 'JobTrak', username: req.name, applied: user.jobs });
  });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});
