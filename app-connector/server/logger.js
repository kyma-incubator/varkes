var winston = require("winston")
module.exports = {
    logger: winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [
            //
            // - Write to all logs with level `info` and below to `combined.log` 
            // - Write all logs error (and below) to `error.log`.
            //
            new winston.transports.File({ filename: process.env.NODE_ENV ? `${process.env.NODE_ENV}.log` : 'server.log' })
        ]
    })
}