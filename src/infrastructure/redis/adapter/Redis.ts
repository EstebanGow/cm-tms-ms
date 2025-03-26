import * as redis from 'redis'
import { log, error } from 'console'
import ENV from '@common/envs/Envs'

const url = `redis://${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`
export const redisClient = redis.createClient({ url })
redisClient
    .connect()
    .then(() => log('[INFO] Conectado al servidor de redis'))
    .catch((err) => log('[ERROR] No se pudo conectar a redis: ', err))

redisClient.on('error', (err) => error('ERR_REDIS:', err.message))

export default redisClient
