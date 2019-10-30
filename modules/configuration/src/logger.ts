#!/usr/bin/env node
'use strict'

import * as winston from "winston"

export function logger(loggerLabel: string): winston.Logger {
    const console_logger = new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.label({ label: loggerLabel }),
            winston.format.printf((info: any) => `${info.level} ${info.label}: ${info.message}`)
        )
    })

    const file_logger = new winston.transports.File({ filename: process.env.NODE_ENV ? `logs/${process.env.NODE_ENV}.log` : 'logs/server.log' })

    const logger = winston.createLogger({
        level: process.env.DEBUG ? 'debug' : 'info',
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.json()
        ),
        transports: [
            process.env.NODE_ENV === "test" ? file_logger : console_logger
        ]
    })
    return logger
}
