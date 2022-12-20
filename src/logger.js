const winston = require('winston');

module.exports = winston.createLogger({
    level: process.env.LOGGING_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: process.env.npm_package_name },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'api.log', level: process.env.LOGGING_LEVEL }),
        new winston.transports.Console()
    ],
});