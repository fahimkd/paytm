/**
 * Created by faheem on 22/09/16.
 */
var fs = require('fs');
var _ = require('lodash');

exports.login = function (req, res) {
  var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
  res.send(_.filter(data.employees, {username: req.body.username, password: req.body.password})[0]);
};
