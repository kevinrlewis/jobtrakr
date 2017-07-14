// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var jobSchema = mongoose.Schema({

  website : String

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Job', jobSchema);
