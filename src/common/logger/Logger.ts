import ENV from '@common/envs/Envs'
import { createLogger, format, transports } from 'winston'

export interface Log {
    info: (module: string, key: string, value: unknown) => void
    error: (module: string, key: string, value: unknown) => void
}

function getLogger(): Log {
    const logger = createLogger({
        format: format.json(),
        defaultMeta: { domain: ENV.DOMAIN, service: ENV.SERVICE_NAME, version: ENV.VERSION },
        transports: [
            new transports.Console({
                level: ENV.LOGGER_LEVEL,
            }),
        ],
    })
    return {
        info: (module: string, key: string, value: unknown) => {
            logger.info({ module, key, value })
        },
        error: (module: string, key: string, value: unknown) => {
            logger.error({ module, key, value })
        },
    }
}

export const logger = getLogger()
