#!/usr/bin/env node

var create = require(__dirname + "/lib/create");
console.log("Creating Mock Engine!!")
create.createProjectStructure(__dirname, create.getCurrentDirectoryBase());