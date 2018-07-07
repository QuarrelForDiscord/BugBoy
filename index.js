const Eris = require("eris");
const mysql = require('mysql');
var MongoClient = require("mongodb").MongoClient;

<<<<<<< HEAD
MongoClient.connect(process.env.databaseurl, function(error, db) {
    if (error) return funcCallback(error);
    console.log("Connected to bug report database'");
=======
var connection = mysql.createConnection({
    host: process.env.sqlhost,
    user: process.env.sqluser,
    password: process.env.sqlpass,
    database: process.env.sqldatabase
>>>>>>> 95ed334a41039fb2fad538fc512ac4e0867948ce
});

///////////////////////
//// UTILS ///////////
/////////////////////
const catchAsync = fn => (
    (req, res, next) => {
      const routePromise = fn(req, res, next);
      if (routePromise.catch) {
        routePromise.catch(err => next(err));
      }
    }
  );

///////////////////////
////  DISCORD BOT  ////
///////////////////////

// Create bot
const bot = new Eris(process.env.bottoken)


bot.on('ready', () => {
    console.log("I'm a real botboy!")
});

bot.on('messageCreate', (message) => {
    // So the bot doesn't reply to iteself
    if (message.author.bot) return;

    // Check if the message starts with the `!` trigger
    var content = message.content;

    if (message.content.toLowerCase().trim().startsWith("/bug")) {
        if (message.content.toLowerCase().trim() == "/bug") {
            bot.createMessage(message.channel.id, "To report a bug, please use the following template: **/bug** `name and short description of the bug` **/platform** `All, Xbox, Mobile, PC, Hololens, Other` **/details** `More details about the bug` **/severity** `How bad is it, from 1-10?`. All fields are optional, except for the title. \n You can also use the 'Report Bug' menu from within Discord UWP.")
        }
        else if (message.content.toLowerCase().trim() == "/bug list") {
            connection.query("SELECT * FROM Bugs", function (error, results, fields) {
                if(error!=null)
                    bot.createMessage(message.channel.id, "Database error:"+error);
                if(results !=null)
                var resultstring;
                results.forEach(function (row) {
                    resultstring+=row.title+"\n";
                });
                bot.createMessage(message.channel.id, resultstring);
            });
        }
        else {
            //parameters are: bug title, platform, details, or severity
            var lcm = message.content.toLowerCase();
            var indexes = [];
            var platformIndex = lcm.indexOf("/platform");
            var detailsIndex = lcm.indexOf("/details");
            var severityIndex = lcm.indexOf("/severity");

            if (platformIndex != -1) indexes.push(platformIndex);
            if (detailsIndex != -1) indexes.push(detailsIndex);
            if (severityIndex != -1) indexes.push(severityIndex);

            indexes.sort((a, b) => a - b);

            var title;
            var platform;
            var details;
            var severity;

            for (i = 0; i < indexes.length; i++) {
                let endPos;
                if (indexes.length - 1 == i) endPos = message.content.length;
                else endPos = indexes[i + 1];
                if (indexes[i] == platformIndex)
                    platform = message.content.substring(indexes[i] + 9, endPos);
                if (indexes[i] == detailsIndex)
                    details = message.content.substring(indexes[i] + 8, endPos);
                if (indexes[i] == severityIndex)
                    severity = message.content.substring(indexes[i] + 9, endPos);
            }

            var endPos = indexes[0];
            if (endPos == null) endPos = message.content.length;
            title = message.content.substring(4, endPos);

            var foundPL = false;
            if (platform == "xbox" || platform == "mobile" || platform == "desktop" || platform == "hololens" || platform == "iot")
                foundPL = true;

            var checknames = function (array, name) {
                if (!foundPL)
                    array.forEach((str) => {
                        if (!foundPL && str == platform.toLowerCase().trim()) { platform = name; foundPL = true; }
                    });
            }

            var xboxnames = ["xbox one s", "xbox", "xbox one", "xbox one x", "xbo", "xbx", "xox", "box"];
            var wpnames = ["windows phone", "wp", "wp8.1", "wp8", "windows mobile", "windows mobile 10", "wm10", "wm", "phone", "mobile"];
            var pcnames = ["pc", "laptop", "windows 10", "windows", "w10", "computer"];
            var hlnames = ["hololens", "hl", "holographic"];
            var iotnames = ["iot", "internet of things"]
            if (platform != undefined) {
                checknames(xboxnames, "xbox");
                checknames(wpnames, "mobile");
                checknames(pcnames, "desktop");
                checknames(hlnames, "hololens");
                checknames(iotnames, "iot");
            }

            if (platform == "xbox" || platform == "mobile" || platform == "desktop" || platform == "hololens" || platform == "iot")
                platform = platform; //do nothing
            else
                platform = undefined;

            severity = Number(severity);
            if (severity == NaN) severity = undefined;
            else if (severity > 10) severity = 10;
            else if (severity < 1) severity = 1;
            bot.createMessage(message.channel.id, "**Bug:** `" + mysql.escape(title) + "`\n\n" + "**Platform:** `" + mysql.escape(platform) + "`\n\n" + "**Details:** `" + mysql.escape(details) + "`\n\n" + "**Severity** `" + mysql.escape(severity) + "`");
            connection.query("INSERT INTO Bugs (title, description, platform, dateadded, datefixed, severity, position) VALUES ("+mysql.escape(title)+", "+mysql.escape(details)+", "+ mysql.escape(platform)+", CURDATE(), null,"+ mysql.escape(severity) + ", 0)")
        }
    }
});

bot.connect();



////////////////////////
////     WEBSITE    ////
////////////////////////
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
const btoa = require('btoa');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.use(logger('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
    connection.query("SELECT * FROM Bugs", function (error, results, fields) {
        res.render('index', {bugs:results});
    });
    
  });

app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
app.listen(3000, () => console.log("And i'm listening to port 3000!"))
module.exports = app;
