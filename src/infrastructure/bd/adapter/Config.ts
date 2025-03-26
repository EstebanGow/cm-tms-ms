import ENV from '@common/envs/Envs'
import pgPromise, { IMain, IDatabase } from 'pg-promise'
import { IConnectionParameters } from 'pg-promise/typescript/pg-subset'

const PG_CONECTION: IConnectionParameters = {
    host: ENV.POSTGRES_HOST,
    port: +ENV.PG_PORT,
    user: ENV.POSTGRES_USER,
    password: ENV.POSTGRES_PASS,
    database: ENV.POSTGRES_DATABASE,
    connectionTimeoutMillis: 10000000,
    max: 30,
    idleTimeoutMillis: 30000000,
    query_timeout: 25000000,
}
const pgp: IMain = pgPromise()
pgp.pg.types.setTypeParser(pgp.pg.types.builtins.NUMERIC, (value: string) => parseFloat(value))

export const cm = pgp(PG_CONECTION) as IDatabase<IMain>
export default cm
