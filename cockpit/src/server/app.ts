import * as express from 'express';
import * as path from 'path';
const app = express();

function init(domain: string = null) {
    app.use(express.static(path.resolve(__dirname + "/cockpit")));

    var config = {
        domain: domain
    };
    app.get("/config.js", function (req, res) {
        res.type('.js');
        res.send("var config = " + JSON.stringify(config));
    });

    return app;
}

export { init }