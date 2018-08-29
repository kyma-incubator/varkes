var winston = require("winston")
module.exports = {
    logger: winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [

            new winston.transports.File({ filename: process.env.NODE_ENV ? `${process.env.NODE_ENV}.log` : 'server.log' })
        ]
    })
}