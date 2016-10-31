var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');

var app = express();

// set the view engine to ejs

var routes = require('./routes/index');
var client = require('./routes/client');
var tester = require('./routes/tester');

// MongoDB Access library
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongodb://user:user@ds031882.mongolab.com:31882/msaas');
//var db = monk('localhost:27017/Msaas');

app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({secret:'somesecrettokenhere'}));
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(req,res,next){
    req.db = db;
    next();
});

app.get('/first', function(req, res) {
	res.cookie('user','kavin_91');
  res.cookie('project',235).send('done<a href="/second">view</a>');
})

app.use('/', routes);
app.use('/',client);
app.use('/', tester);


app.use(express.static(__dirname + '/public'));
app.listen(1926);

console.log('1926 is the magic port...Run http://localhost:1926/ on browser');