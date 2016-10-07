var jwt = require('jsonwebtoken');
var key = require('./keys.js');

var giveToken = function (req, res) {
  var newBody = JSON.parse(JSON.stringify(req.body));
  newBody.token = jwt.sign(req.body, key);
  res.send(newBody);
};

var checkToken = function (req, res, next) {
  
  if (!req.headers.jwt) {

    res.sendStatus(401);

  } else {

    jwt.verify(req.headers.jwt, key, function (error, decoded) {

      if (error) {

        res.sendStatus(401);

      } else {

        res.sendStatus(200);

      }
    });
  }
};

module.exports = {
  giveToken: giveToken,
  checkToken: checkToken,
};