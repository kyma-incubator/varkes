#!/usr/bin/env node
'use strict'

import * as winston from "winston"

export function logger(loggerLabel: string): winston.Logger {
    const local_logger = new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.label({ label: loggerLabel }),
            winston.format.printf((info: any) => `${info.level} ${info.label}: ${info.message}`)
        )
    })

    const production_logger = new winston.transports.Console({
        format: winston.format.combine(
            winston.format.label({ label: loggerLabel }),
            winston.format.json()
        )
    })
    const logger = winston.createLogger({
        level: process.env.DEBUG ? 'debug' : 'info',
        format: winston.format.splat(),
        transports: [
            process.env.NODE_ENV === "production" ? production_logger : local_logger
        ]
    })
    return logger
}
