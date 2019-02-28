#!/usr/bin/env node
'use strict'

var winston = require("winston")

const console_logger = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.label({ label: 'openapi-mock' }),
    winston.format.printf(info => `${info.level} ${info.label}: ${info.message}`)
  )
})

const file_logger = new winston.transports.File({ filename: process.env.NODE_ENV ? `logs/${process.env.NODE_ENV}.log` : 'logs/server.log' })

module.exports = {
  logger: winston.createLogger({
    level: process.env.DEBUG ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.json()
    ),
    transports: [
      process.env.NODE_ENV === "test" ? file_logger : console_logger
    ]
  })
}
