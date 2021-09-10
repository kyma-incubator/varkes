import * as express from 'express';
import * as path from 'path';
import * as config from "varkes-configuration"

const app = express();
const helmet = require('helmet')

async function init(config: config.Config) {
    app.use(helmet({
        frameguard: false
      }))
    app.use(express.static(path.resolve(__dirname + "/cockpit")));

    var payload = {
        name: config.name
    };
    app.get("/config", function (req, res) {
        res.type('json');
        res.send(payload);
    });

    return app;
}

export { init }