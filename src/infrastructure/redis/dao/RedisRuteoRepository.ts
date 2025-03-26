import { injectable } from 'inversify'
import { RedisClientType } from 'redis'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RedisRepository } from '@common/repositories'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'

@injectable()
export class RedisRuteoRepository implements RedisRepository {
    private redis = DEPENDENCY_CONTAINER.get<RedisClientType>(TYPESDEPENDENCIESGLOBAL.RedisClient)

    async consultar(clave: string): Promise<object | Array<object> | null> {
        try {
            const datos = await this.redis.get(clave)
            if (datos) {
                return JSON.parse(datos)
            }
            return null
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async obtenerRecurso(clave: string): Promise<object | null> {
        const getUnit = await this.redis.get(`${clave}`)
        if (getUnit) {
            const { fuente } = JSON.parse(getUnit)
            return fuente
        }
        return null
    }

    async guardar(data: object, nombre: string, timeExp = 691200): Promise<void> {
        try {
            await this.redis.setEx(nombre, timeExp, JSON.stringify(data))
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async eliminar(clave: string): Promise<void> {
        try {
            await this.redis.del(clave)
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

export default RedisRuteoRepository
