'use strict';
const fs = require('fs');
const LOGGER = require("./logger").logger

module.exports = {
    writeToFile: function (path, textString, overwrite) {
        if (!fs.existsSync(path) || overwrite) {
            fs.writeFile(path, textString + "\n", function (err) {
                if (err) {
                    LOGGER.error("Error while writing new swagger file at %s:%s", path, err)
                    return
                }
            });
        }
        else {
            fs.appendFile(path, textString + "\n", function (err) {
                if (err) {
                    LOGGER.error("Error while appending to swagger file at %s:%s", path, err)
                    return
                }
            });
        }
    }
}