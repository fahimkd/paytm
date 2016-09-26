const employees = require('./../api/employees');
const reviews = require('./../api/reviews');
const auth = require('./../api/auth');

module.exports = function (app) {
  app.get('/ui/*', function (req, res, next) {

    var options = {
      root: __dirname + '/../public/app/',
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };

    var fileName = req.params[0];
    res.sendFile(fileName, options, function (err) {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      }
      else {
        console.log('Sent:', fileName);
      }
    });

  });

  app.post('/api/login', auth.login);

  app.get('/api/employees', employees.browse);
  app.get('/api/employee/:id', employees.read);
  app.put('/api/employee/:id', employees.edit);
  app.post('/api/employee', employees.add);
  app.delete('/api/employee/:id', employees.delete);

  app.post('/api/assign', reviews.assign);

  app.get('/api/employee/:employee_id/review/:review_id', reviews.read);
  app.post('/api/review', reviews.add);
  app.delete('/api/review/:review_id', reviews.delete);

  /* GET home page. */
  app.get('*', function(req, res, next) {
    res.sendFile('public/app/index.html',{root: __dirname + '/../'});
  });
}
