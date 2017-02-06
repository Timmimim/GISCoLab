var mongoose = require('mongoose');
var User = mongoose.model('User');
var Project = mongoose.model('Project');

// Load user data
module.exports.profileRead = function(req, res) {

  if (!req.payload._id) {
    res.status(401).json({
      "message" : "UnauthorizedError: private profile"
    });
  } else {
    User
      .findById(req.payload._id, function (err, user){
          if(err){
              res.status(401).json("couldnt load profile");
          } else {
              res.status(200).json(user);
          }
      });
  }

}

// Load user data
module.exports.profileRead2 = function(req, res){

    User
        .findById(req.params.id, function(err, obj){
            if(err){
                res.status(401).json("could not load the profile");
            } else {
                res.status(200).json(obj);
            }
        });
}

// Update the profile
module.exports.profileUpdate = function(req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: cannot update profile without being logged in to it"
        });
    } else{
        User.findByIdAndUpdate(req.payload._id, req.body, {runValidators: true, upsert: true})
            .exec(function (err, user) {
                res.status(200).json(user);
            })
    }
};

// Delete the profile
module.exports.profileDelete = function (req, res) {
    if (!req.payload._id) {
        res.status(401).json({
            "message": "UnauthorizedError: cannot delete profile without being logged in to it"
        });
    } else {
        User.findById(req.payload._id)
            .exec(function (err, value) {
                if(err) {
                    res.status(401).json({
                        "message": "DeleteError: could not delete feature"
                    });
                } else {
                    console.log('feature removed (logging just for testing)');
                    value.remove();
                    res.status(200).send('removed Feature');
                }

            });
    }
};