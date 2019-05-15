import * as express from 'express';
import * as path from 'path';
const app = express();

async function init(domain: string = null) {
    app.use(express.static(path.resolve(__dirname + "/cockpit")));

    var config = {
        domain: domain
    };
    app.get("/config", function (req, res) {
        res.type('json');
        res.send(config);
    });

    return app;
}

export { init }