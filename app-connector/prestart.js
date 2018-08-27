const fs = require("fs")
var cp = require("child_process")

!fs.existsSync("keys") ? fs.mkdirSync("keys") : {}

cp.exec("openssl genrsa -out keys/ec-default.key 2048", (err, stdout, stderr) => {
    err ? console.log(err) : console.log(stdout)
})
