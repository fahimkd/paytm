/**
 * Created by faheem on 22/09/16.
 */
var fs = require('fs');
var _ = require('lodash');

exports.browse = function (req, res) {
  var userId = req.cookies.user;
  var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
  var currentEmployee = _.filter(data.employees, {id: parseInt(userId)})[0];
  if (currentEmployee.admin) {
    res.send(data.employees);
  } else {
    var assignedEmployeesIds = currentEmployee.assigned || [];
    var assignedEmployees = _.filter(data.employees, function (employee) {
     return assignedEmployeesIds.indexOf(employee.id) != -1;
    });
    res.send(assignedEmployees);
  }
};

exports.read = function (req, res) {
  var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
  res.send(_.filter(data.employees, {id: parseInt(req.params.id)})[0]);
};

exports.edit = function (req, res) {
  var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
  data.employees[_.findIndex(data.employees, {id: parseInt(req.params.id)})] = req.body;
  fs.writeFileSync(__dirname+'/data.json', JSON.stringify(data, null, 2));
  res.send({data: true});
};

exports.add = function (req, res) {
  var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
  var newEmployee = _.clone(req.body, true);
  newEmployee.id = data.employees.length + 1;
  newEmployee.reviews = [];
  data.employees.push(newEmployee);
  fs.writeFileSync(__dirname+'/data.json', JSON.stringify(data, null, 2));
  res.send({data: newEmployee});
};

exports.delete = function (req, res) {
  var userId = req.cookies.user;
  if (userId != req.params.id) {
    var data = JSON.parse(fs.readFileSync(__dirname+'/data.json', 'utf8'));
    delete data.employees[_.findIndex(data.employees, {id: parseInt(req.params.id)})];
    fs.writeFileSync(__dirname+'/data.json', JSON.stringify(data, null, 2));
    res.send({data: true});
  } else {
    res.send({data: false, message: 'You cannot delete you account omn account!'});
  }
};
