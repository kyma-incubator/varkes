
var fs = require("fs");
var json = {};
module.exports = 
{
     readJsonFileSync:function(filepath, encoding){

        if (typeof (encoding) == 'undefined'){
            encoding = 'utf8';
        }
        var file = fs.readFileSync(filepath, encoding);
        return JSON.parse(file);
    }
}
