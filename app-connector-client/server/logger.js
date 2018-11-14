var winston = require("winston")

const console_logger = new winston.transports.Console({
  format: winston.format.simple()
})

const file_logger = new winston.transports.File({ filename: process.env.NODE_ENV ? `${process.env.NODE_ENV}.log` : 'server.log' })


module.exports = {

  logger: winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      process.env.NODE_ENV === "test" ? file_logger : console_logger
    ]
  })
}
