'use strict';
const fs = require('fs');
var morgan = require('morgan');
module.exports = {

    writeToFile: function (path, textString, overwrite) {
        if (!fs.existsSync(path) || overwrite) {
            fs.writeFile(path, textString + "\n", function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        }
        else {
            fs.appendFile(path, textString + "\n", function (err) {
                if (err) {
                    return console.log(err);
                }
            });
        }
    },
    getCurrentDateTime: function () {
        var currentdate = new Date();
        var datetime = "Reached on " + currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
        return datetime;
    },
    registerLogger: function (app) {
        morgan.token('header', function (req, res) {
            if (req.rawHeaders && Object.keys(req.rawHeaders).length != 0)
                return req.rawHeaders;
            else
                return "-";
        });
        morgan.token('body', function (req, res) {
            console.log(req.body)
            if (req.body && Object.keys(req.body).length != 0)
                return JSON.stringify(req.body);
            else
                return "-";
        });
        var logging_string = '[:date[clf]], User: :remote-user, ":method :url, Status: :status"\n Header:\n :header\n Body:\n :body'
        var requestLogStream = fs.createWriteStream('requests.log', { flags: 'a' })
        app.use(morgan(logging_string, { stream: requestLogStream }), morgan(logging_string))
        app.get('/requests', function (req, res, done) {

            var text = fs.readFileSync("requests.log", "utf8");
            res.status(200);
            res.send(text);
        });
    }
}