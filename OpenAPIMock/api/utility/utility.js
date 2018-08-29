'use strict';
const fs = require('fs');
module.exports = {

    writeToFile: function (path, textString, overwrite) {
        console.log("entered write to file")
        if (!fs.existsSync(path) || overwrite) {
            console.log("file doesn't exist");
            fs.writeFile(path, textString + "\n", function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });
        }
        else {
            fs.appendFile(path, textString + "\n", function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
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
    }
}