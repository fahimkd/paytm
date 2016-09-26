/**
 * Created by faheem on 22/09/16.
 */
var fs = require('fs');
var _ = require('lodash');

exports.read = function (req, res) {
  var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
  var employee = _.filter(data.employees, {id: parseInt(req.params.employee_id)})[0];
  res.send(_.filter(employee.reviews, {id: parseInt(req.params.review_id)})[0]);
};

exports.add = function (req, res) {
  var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
  var targetEmployee = _.filter(data.employees, {id: parseInt(req.body.employee_id)})[0];
  var newReview = _.clone(req.body, true);
  newReview.id = targetEmployee.reviews.length + 1;
  delete newReview.employee_id;
  targetEmployee.reviews.push(newReview);
  fs.writeFileSync(__dirname+'/data.json', JSON.stringify(data, null, 2));
  res.send({data: true});
};

exports.delete = function (req, res) {
  res.send({data: true});
};

exports.assign = function (req, res) {
  var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
  var sourceEmployee = _.filter(data.employees, {id: parseInt(req.body.source_employee_id)})[0];
  sourceEmployee.assigned = sourceEmployee.assigned || [];
  if (sourceEmployee.assigned.indexOf(req.body.dest_employee_id) == -1) {
    sourceEmployee.assigned.push(req.body.dest_employee_id);
    fs.writeFileSync(__dirname+'/data.json', JSON.stringify(data, null, 2));
  }
  res.send({data: true});
};
