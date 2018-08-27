var app = require("express")
var connector = require("./connector")
var url
app.listen(3000,function(){
app.emit('server started')
app.post('/startConnection/',function(req,res){

console.log(res.body);
});

});