// set up ======================================================================
var express = require('express');
var app = express(); 						// create our app with express
var port = process.env.PORT || 8080; 				// set the port
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')


// configuration ===============================================================

app.use(express.static('public')); 		// set the static files location /public/app will be /ui for users
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser())


// routes ======================================================================
require('./routes/index')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("Server listening on port " + port);
