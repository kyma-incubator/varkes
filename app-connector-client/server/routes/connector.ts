import request = require("request")
import fs = require("fs");
import path = require("path");
import { LOGGER } from "../logger"
import { CONFIG } from "../config"
import { pki } from "node-forge"
import url = require("url");
import services = require("./services");
import { Request, Response } from "express"
import events = require("./events");
const keyFile = path.resolve(CONFIG.keyDir, CONFIG.keyFile)
const certFile = path.resolve(CONFIG.keyDir, CONFIG.crtFile)


const keysDirectory = path.resolve(CONFIG.keyDir)

function authenticateToKyma(localKyma: boolean, url: string) {
    return new Promise((resolve, reject) => {
        LOGGER.debug("Connecting ..")
        request({ //Step 4
            url: url,
            method: "GET",
            rejectUnauthorized: !localKyma
        },
            function (error, response, body) {
                if (error) {
                    reject(error)
                }
                else if (response.statusCode !== 200) reject(new Error(response.statusCode.toString()))
                else if (response.statusCode == 200) {
                    LOGGER.debug("Connector received: %s", body)
                    let URLs = JSON.parse(body).api
                    runOpenSSL(JSON.parse(body).certificate.subject)
                    request.post({ //Step 9
                        url: JSON.parse(body).csrUrl,
                        json: { csr: fs.readFileSync(`${keysDirectory}/${CONFIG.csrFile}`, "base64") },
                        rejectUnauthorized: !localKyma
                    },
                        function (error, response, body) {
                            if (error) {
                                reject(error)
                            }
                            else if (response.statusCode == 201) {
                                let CRT_base64_decoded = (Buffer.from(body.crt, 'base64').toString("ascii"))
                                //Step 11
                                fs.writeFileSync(`${keysDirectory}/${CONFIG.crtFile}`, CRT_base64_decoded)
                                LOGGER.info("Connected to %s", URLs.metadataUrl)
                                resolve(URLs)
                            }
                        }
                    )
                }
            }
        )
    })
}
function disconnect(req: Request, res: Response) {
    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))) {
        fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile))
    }
    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.crtFile))) {
        fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.crtFile))
    }
    if (fs.existsSync(path.resolve(CONFIG.keyDir, CONFIG.csrFile))) {
        fs.unlinkSync(path.resolve(CONFIG.keyDir, CONFIG.csrFile))
    }
    CONFIG.URLs = {
        metadataUrl: "",
        eventsUrl: "",
        certificatesUrl: ""
    }

    res.status(204).send()
}
function info(req: Request, res: Response) {
    let info = createInfo()
    if (info) {
        res.status(200).send(info)
    } else {
        res.status(400).send({ error: "Not connected to a Kyma cluster" })
    }
}
function key(req: Request, res: Response) {
    res.download(keyFile)
}
function cert(req: Request, res: Response) {
    res.download(certFile)
}

function createInfo() {
    if (CONFIG.URLs.metadataUrl !== "") {
        const myURL = new url.URL(CONFIG.URLs.metadataUrl)
        let response = {
            "cluster_domain": "",
            "re_name": "",
            "eventsUrl": "",
            "metadataUrl": ""
        }
        response.cluster_domain = myURL.hostname.split(".")[1]
        response.re_name = myURL.pathname.split("/")[1]
        response.eventsUrl = CONFIG.URLs.eventsUrl;
        response.metadataUrl = CONFIG.URLs.metadataUrl;
        return response
    }
    return null
}

function runOpenSSL(subject: any) {

    LOGGER.debug("Creating CSR using subject %s", subject)
    let privateKey = fs.readFileSync(keyFile, 'utf8')
    let pk: any = pki.privateKeyFromPem(privateKey)
    //let publicKey = pki.setRsaPublicKey(pk.n, pk.e)
    let publicKey = pki.rsa.setPublicKey(pk.n, pk.e)
    //let publicKey = pki.publicKeyFromPem(privateKey)


    // create a certification request (CSR)
    var csr = pki.createCertificationRequest();
    csr.publicKey = publicKey

    csr.setSubject(parseSubjectToJsonArray(subject))
    csr.sign(pk)
    fs.writeFileSync(`${keysDirectory}/${CONFIG.csrFile}`, pki.certificationRequestToPem(csr))
}

function parseSubjectToJsonArray(subject: string) {
    let subjectsArray: Array<any> = []
    subject.split(",").map((el: string) => {
        const val = el.split("=")
        subjectsArray.push({
            shortName: val[0],
            value: val[1]
        })
    })

    return subjectsArray
}

function connect(req: Request, res: Response) {
    if (!req.body) res.sendStatus(400);


    authenticateToKyma(req.query.localKyma, req.body.url).then((data: any) => {
        if (req.query.localKyma == true) {
            var result = data.metadataUrl.match(/https:\/\/[a-zA-z0-9.]+/);
            data.metadataUrl = data.metadataUrl.replace(result[0], result[0] + ":" + CONFIG.nodePort);
        }
        CONFIG.URLs = data
        fs.writeFileSync(path.resolve(CONFIG.keyDir, CONFIG.apiFile), JSON.stringify(data), "utf8")

        if (req.body.register) {
            LOGGER.debug("Auto-register APIs")
            var hostname = req.body.hostname || "http://localhost"

            services.createServicesFromConfig(req.query.localKyma, hostname, CONFIG.varkesConfig.apis).then(() => {
                events.createEventsFromConfig(CONFIG.varkesConfig.events).then(() => {
                    LOGGER.debug("Auto-registered %d APIs and %d Event APIs", CONFIG.varkesConfig.apis ? CONFIG.varkesConfig.apis.length : 0, CONFIG.varkesConfig.events ? CONFIG.varkesConfig.events.length : 0)
                })
            })

            LOGGER.debug("Auto-registered %d APIs and %d Event APIs", CONFIG.varkesConfig.apis ? CONFIG.varkesConfig.apis.length : 0, CONFIG.varkesConfig.events ? CONFIG.varkesConfig.events.length : 0)
        }

        let info = createInfo()
        if (info) {
            res.status(200).send(info)
        } else {
            res.status(400).send({ error: "Not connected to a Kyma cluster" })
        }
    }).catch(error => {
        let message = "There is an error while registering.\n Please make sure that your token is unique"
        LOGGER.error("Failed to connect to kyma cluster: %s", error)
        res.statusCode = 401
        res.send(message)
    })




}



var connectionRouter = require("express").Router()
connectionRouter.get("/", info)
connectionRouter.delete("/", disconnect)
connectionRouter.get("/key", key)
connectionRouter.get("/cert", cert)
connectionRouter.post("/", connect)
module.exports = connectionRouter