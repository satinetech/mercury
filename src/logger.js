import { createLogger, format as _format, transports as _transports } from 'winston';

export default createLogger({
    level: process.env.LOGGING_LEVEL,
    format: _format.combine(
        _format.timestamp(),
        _format.json()
    ),
    defaultMeta: { service: process.env.npm_package_name },
    transports: [
        new _transports.Console()
    ],
});