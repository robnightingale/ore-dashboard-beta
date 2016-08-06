/**
 * Created by robnightingale on 04/08/2016.
 */

var path = require('path');
var http = require('http');
var express = require('express');
// var express = require('./');
var app = express.createServer();

app.use(express.logger('dev'));

app.get('/hello', function(req, res){
    console.log(req.protocol);
    res.send('hello');
});

app.get('/helloworld', function(req, res){
    console.log(req.protocol);
    res.send('hello world');
});

app.listen(3000);


// var app = express();
//
//
// app.use(express.static(path.join(__dirname, 'public')));
// app.set('port', process.env.PORT || '5000');
//
// using the main layout
// app.get("/hello", function(req,res){
//     var data = {name : "abc"};
//     res.render('hello', data);
// });
//
// module.exports = app;
// var server = http.createServer(app);
// server.listen(app.get('port'), function () {
//     console.log('Express server listening on port ' + app.get('port'));
// });
