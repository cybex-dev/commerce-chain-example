var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app_config = require('./app_config');

// Blockchain Example
let _http = require('http');
let _ws = require('./routes/ws');

var indexRouter = require('./routes/index');
var app = express();


let contractInterface = require('./scripts/interface');

// debug - disable blockchain
if (app_config.enableBlockchain) {

    // Initialize Blockchain
    contractInterface.init((contract) => {
        console.log("Blockchain initialized");

        // Check if we should use websocket
        if (app_config.websocket.enable) {
            _ws.init(app, contractInterface);

        }
    });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
