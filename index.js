const Eris = require("eris");
const MongoClient = require("mongodb").MongoClient;
const ejs = require("ejs");

require("dotenv").config();

var db;

MongoClient.connect(process.env.databaseurl, function (err, client) {
    if (err) console.log("Failed to connect to database")
    else console.log("Connected successfully to database");
    db = client.db("bugboyreports");
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

/////////////////////////
////  DISCORD BOT  /////
///////////////////////

// Create bot
const bot = new Eris(process.env.bottoken)


bot.on('ready', () => {
    console.log("I'm a real botboy!")
});

function isInt(value) {
    var x = parseFloat(value);
    return !isNaN(value) && (x | 0) === x;
}
function array_move(inputArray, old_index, new_index) {
    var arr = inputArray.slice(0);

    while (old_index < 0) {
        old_index += arr.length;
    }
    while (new_index < 0) {
        new_index += arr.length;
    }
    if (new_index >= arr.length) {
        var k = new_index - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
     arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);  
   return arr;
}

bot.on('messageCreate', (message) => {
    // So the bot doesn't reply to iteself
    if (message.author.bot) return;

    // Check if the message starts with the `!` trigger
    var content = message.content;

    if (message.content.toLowerCase().trim().startsWith("/bug")) {
        if (message.content.toLowerCase().trim() == "/bug") {
            bot.createMessage(message.channel.id, "To report a bug, please use the following template: **/bug** `name and short description of the bug` **/platform** `All, Xbox, Mobile, PC, Hololens, Other` **/details** `More details about the bug` **/severity** `How bad is it, from 1-10?`. All fields are optional, except for the title. \n You can also use the 'Report Bug' menu from within Discord UWP.")
        } 
        else if (message.content.toLowerCase().trim() == "/buglist" || message.content.toLowerCase().trim() == "/bugs") {
            db.collection("bugs").find().toArray(function (error, results) {
                if (error) bot.createMessage(message.channel.id, "Database error:" + error);
                if (results == null) bot.createMessage(message.channel.id, "Empty database!");
                var resultstring = "";
                var count = 0;
                results.sort(function(a, b){return a.position-b.position});
                results.forEach(function (i, obj) {
                    if(!i.details.trim()) i.details = " ";
                    if(!i.title.trim()) i.title = "`<missing title>`";
                    if(!i.username.trim()) i.username = "`<missing username>`";
                    resultstring += "`" + i.position + "`: **" + i.title.trim() + "**, " + i.details.trim() + " *(submitted by " + i.username + ")*\n";
                    count++;
                });
                bot.createMessage(message.channel.id, resultstring);
            });
        } 
        else if (message.content.toLowerCase().trim().startsWith("/bugrespond") || message.content.toLowerCase().trim().startsWith("/buganswer")) {
            var searchstring = message.content.trim().replace("/bugrespond", "").replace("/buganswer", "").trim();
            var bugposition = searchstring;
            var responsestring;
            if (!isInt(bugposition)) {
                var bugposition = searchstring.substring(0, searchstring.indexOf(' '));
                responsestring = searchstring.substring(bugposition.length);
            }
            if (isInt(bugposition)) {
                if (responsestring == "" || responsestring == undefined) responsestring = " ";
                db.collection("bugs").updateOne({ position: parseInt(bugposition) }, { $set: { "response": responsestring },
                }, function (err, client) {
                    if (err) bot.createMessage(message.channel.id, "Failed to respond!");
                    else if (responsestring == " ") bot.createMessage(message.channel.id, "Removed resonse from bug report " + bugposition + "!");
                    else bot.createMessage(message.channel.id, "Responded `" + responsestring + "` to bug report " + bugposition + "!");
                })
            }
        } 
        else if (message.content.toLowerCase().trim().startsWith("/bugremove") || message.content.toLowerCase().trim().startsWith("/bugdelete")) {
            var searchstring = message.content.toLowerCase().trim().replace("/bugremove", "").trim();
            var bugposition = searchstring;
            if (!isInt(bugposition)) {
                var bugposition = searchstring.substring(0, searchstring.indexOf(' '));
            }
            if (isInt(bugposition)) {
                db.collection("bugs").findOne({position: parseInt(bugposition)}, true,
                    function (err, client) {
                        if (client == null) bot.createMessage(message.channel.id, "That bug doesn't exist!");
                        else {
                            db.collection("bugs").remove({
                                position: parseInt(bugposition)
                            });
                            bot.createMessage(message.channel.id, "Removed bug report `" + bugposition + "`");
                        }
                    }
                )
            }
        } 
        else if (message.content.toLowerCase().trim().startsWith("/bugmove")) {
            var searchstring = message.content.toLowerCase().trim().replace("/bugmove", "").trim();
            var values = searchstring.split(/[^\d]+/);
            if (values.length < 2) {
                bot.createMessage(message.channel.id, "Invalid positions!");
            } 
            else {
                var startposition = parseInt(values[0]);
                var endposition = parseInt(values[1]);
                if(startposition == endposition){
                    bot.createMessage(message.channel.id, "You can't move something where it already is");
                    return;
                }
                db.collection("bugs").findOne({position: parseInt(startposition)}, true,
                    function (err, client) {
                        if (client == null) bot.createMessage(message.channel.id, "The bug you want to move doesn't exist!");
                        else {
                            db.collection("bugs").findOne({position: parseInt(endposition)}, true,
                                function (err, client) {
                                    if (client == null) bot.createMessage(message.channel.id, "The target destination doesn't exist!");
                                    else {
                                        db.collection("bugs").find().toArray(function (error, results) {
                                            results.sort(function(a, b){return a.position-b.position});
                                            
                                            var reordered = array_move(results, startposition-1, endposition-1);
                                            for(var i = 0; i < reordered.length; i++){
                                                reordered[i].position = i+1;
                                            }
                                            reordered.sort(function(a, b){return a.position-b.position});
                                            var resultstring = "*New bug report list:*\n";
                                            for(var i = 0; i < reordered.length; i++){
                                                if(!reordered[i].details) reordered[i].details = " ";
                                                if(!reordered[i].title) reordered[i].title = "`<missing title>`";
                                                if(!reordered[i].username) reordered[i].username = "`<missing username>`";
                                                resultstring += "`" + reordered[i].position + "`: **" + reordered[i].title.trim() + "**, " + reordered[i].details.trim() + " *(submitted by " + reordered[i].username + ")*\n";
                                                if(results[i]._id != reordered[i]._id)
                                                    db.collection("bugs").updateOne({ _id: reordered[i]._id }, { $set: { "position": reordered[i].position }});
                                            }
                                            bot.createMessage(message.channel.id, resultstring);
                                        });
                                    }
                                });
                        }
                    });
                }
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
            var username = message.author.username + "#" + message.author.discriminator;
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
                        if (!foundPL && str == platform.toLowerCase().trim()) {
                            platform = name;
                            foundPL = true;
                        }
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

            db.collection("bugs").find().toArray(function (error, results) {
                var position = results[results.length - 1].position + 1;
                var newObject = {
                    title: title,
                    details: details,
                    platform: platform,
                    severity: severity,
                    position: position,
                    username: username
                };
                if(!title.trim()){
                    bot.createMessage(message.channel.id, "You must give your bug report a title!");
                    return;
                }
                
                db.collection("bugs").insert(newObject, null, function (error, results) {
                    if (error) bot.createMessage(message.channel.id, "Failed to add bug report to database!");
                    const data = {
                        "embed": {
                            "title": "Added bug report:",
                            "url": "https://bugboy.herokuapp.com/",
                            "color": SeverityToColor(severity),
                            "footer": {
                                "text": "Platform:" + platform + " | Severity: " + severity + " | Submitted by " + username
                            },
                            "fields": [{
                                "name": "`" + position + "`: " + title,
                                "value": details
                            }]
                        }
                    };
                    bot.createMessage(message.channel.id, data);

                });
            });
        }
    }
});

bot.connect();

function SeverityToColor(input) {
    if (input == 1 || input == 2) return 2079491;
    else if (input == 3 || input == 4) return 233659;
    else if (input == 5 || input == 6) return 14069504;
    else if (input == 7 || input == 8) return 12282627;
    else if (input == 9 || input == 10) return 12269315;
}

function reorderbugreports(removedpos) {
    db.collection("bugs").find().toArray(function (error, results) {
        if (error) bot.createMessage(message.channel.id, "Database error:" + error);
        if (results == null) bot.createMessage(message.channel.id, "Empty database!");
        var resultstring = "";
        var count = 0;
        results.forEach(function (i, obj) {
            if (i.position < removedpos) i.details = "No details";
            resultstring += +"`: **" + i.title + "**, *" + i.details + "*\n `" + i.position + "`";
            count++;
        });
        bot.createMessage(message.channel.id, resultstring);
    });
}
//////////////////////////
////     WEBSITE    /////
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
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
    db.collection("bugs").find().toArray(function (error, results) {
        if (error) throw error
        else res.render('index', {
            bugs: results
        });
    })
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
app.listen(8080, () => console.log("Listening to port 8080!"))
module.exports = app;