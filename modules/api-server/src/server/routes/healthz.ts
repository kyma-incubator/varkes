#!/usr/bin/env node
'use strict'

import * as express from "express"

async function live(req: express.Request, res: express.Response) {
    res.status(200).send()
}

async function ready(req: express.Request, res: express.Response) {
    res.status(200).send()
}

function router() {
    let router = express.Router()
    router.get("/live", live)
    router.get("/ready", ready)

    return router
}
export { router }