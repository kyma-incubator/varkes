#!/usr/bin/env node
const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
var defaultDocker = "FROM node:alpine\n \
COPY . /app\n \
WORKDIR /app\n \
RUN npm install\n \
EXPOSE 10000\n \
CMD ['npm','start']";
var defaultMake = ".PHONY: ci\n \
ci: resolve validate\n \
resolve:\n \
	npm install\n \
validate:\n \
    npm test";

module.exports = {

    getCurrentDirectoryBase: () => {
        var dest = path.dirname(path.basename(process.cwd()));
        dest = dest.slice(dest.lastIndexOf("\\"));
        return dest;
    },
    createProjectStructure: function (src, dest) {
        try {
            fse.copySync(src, dest, {
                filter: function (path) {
                    if (!(path.indexOf('lib') > -1) && !(path.indexOf(src + '\\node_modules') > -1) &&
                        !(path.indexOf("cli.js") > -1)) {
                        var temp = path.substr(path.indexOf("varkes-openapi-mock"));
                        var count = (temp.match(/\\/g) || []).length;

                        var out = "|";

                        if (count == 0) {
                            out += "--" + path;
                        }
                        for (var i = 0; i < count; i++) {
                            out += "  |" + "++";
                        }
                        if (count > 0) {
                            out += " " + path.substr(path.lastIndexOf("\\"));
                        }
                        console.log(out)
                    }
                    return !(path.indexOf('lib') > -1) && !(path.indexOf(src + '\\node_modules') > -1) &&
                        !(path.indexOf("cli.js") > -1)
                }
            });
            fs.writeFile(dest + "\\Dockerfile", defaultDocker, function () {
                console.log("Dockerfile created!!");
            });
            fs.writeFile(dest + "\\makefile", defaultMake, function () {
                console.log("makefile created!!");
            });
            fs.writeFile(dest + "\\swagger.yaml", "swagger: \"2.0\"", function () {
                console.log("swagger.yaml created");
            });
            console.log('success!');
        } catch (err) {
            console.error(err);
        }
    }
}