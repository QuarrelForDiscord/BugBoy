var express = require('express');
var router = express.Router();

passport.use(new LocalStrategy(
    function(username, password, done) {
      // Find the user from your DB (MongoDB, CouchDB, other...)
      User.findOne({ username: username, password: password }, function (err, user) {
        done(err, user);
      });
    }
  ));
  
  app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
      // Authentication successful. Redirect home.
      res.redirect('/');
    });