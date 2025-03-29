import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import { EquiposRepository } from '@modules/GestionRutas/domain/repositories/EquiposRepository'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import { RedisRepository } from '@common/repositories'
import { IEquipoIn } from '../dto/in'

export default class ConsultarRutasEquipoUseCase {
    private equiposRepository = DEPENDENCY_CONTAINER.get<EquiposRepository>(TYPESDEPENDENCIES.EquiposRepository)

    private redisRepository = DEPENDENCY_CONTAINER.get<RedisRepository>(TYPESDEPENDENCIES.RedisRepository)

    async execute(data: IEquipoIn): Promise<OptimizacionRutaEntity | null> {
        const optimizacionRutas = await this.consultarRutaEquipo(data.idEquipo)
        return optimizacionRutas
    }

    private async consultarRutaEquipo(idEquipo: number): Promise<OptimizacionRutaEntity | null> {
        const rutaEquipoCache = (await this.consultarRutaEquipoCache(idEquipo)) as OptimizacionRutaEntity
        if (rutaEquipoCache) return rutaEquipoCache
        const optimizacionRutas = await this.equiposRepository.obtenerRutasEquipo(idEquipo)
        if (!optimizacionRutas)
            throw new BadMessageException('Error consulta rutas', 'El equipo no tiene una ruta activa')
        return optimizacionRutas
    }

    private async consultarRutaEquipoCache(idEquipo: number) {
        const ruta = await this.redisRepository.consultar(`ruta-${idEquipo}`)
        return ruta
    }
}
