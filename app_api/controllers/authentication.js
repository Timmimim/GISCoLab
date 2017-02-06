var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
/*
   if(!req.body.userName || !req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName) {
     sendJSONresponse(res, 400, {
         "message": "All fields required"
     });
     return;
   }
*/
  var user = new User();

  user.userName = req.body.userName;
  user.email = req.body.email;
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.registrDate = Date.now();
  user.birthday = req.body.birthday;
  user.info = req.body.info;

  user.setPassword(req.body.password);

  user.save(function(err) {
    var token;
    token = user.generateJwt();
    res.status(200);
    res.json({
      "token" : token
    });
  });

};

// Login
module.exports.login = function(req, res) {
/*
   if(!req.body.email || !req.body.password) {
     sendJSONresponse(res, 400, {
       "message": "All fields required"
     });
     return;
   }
*/
  passport.authenticate('local', function(err, user, info){
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if(user){
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token" : token
      });
      console.log(token);
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};
