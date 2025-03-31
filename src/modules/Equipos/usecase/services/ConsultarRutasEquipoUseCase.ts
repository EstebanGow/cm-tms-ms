import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import { RedisRepository } from '@common/repositories'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import { IEquipoIn } from '../dto/in'

export default class ConsultarRutasEquipoUseCase {
    private rutasRepository = DEPENDENCY_CONTAINER.get<RutasRepository>(TYPESDEPENDENCIES.RutasRepository)

    private redisRepository = DEPENDENCY_CONTAINER.get<RedisRepository>(TYPESDEPENDENCIES.RedisRepository)

    private readonly CAUSA_ERROR = 'Error consulta rutas'

    private readonly MENSAJE_ERROR = 'El equipo no tiene una ruta activa'

    async execute(data: IEquipoIn): Promise<OptimizacionRutaEntity | null> {
        const optimizacionRutas = await this.consultarRutaEquipo(data.idEquipo)
        return optimizacionRutas
    }

    private async consultarRutaEquipo(idEquipo: number): Promise<OptimizacionRutaEntity | null> {
        const rutaEquipoCache = (await this.consultarRutaEquipoCache(idEquipo)) as OptimizacionRutaEntity
        if (rutaEquipoCache) return rutaEquipoCache
        const optimizacionRutas = await this.rutasRepository.obtenerRutasEquipo(idEquipo)
        if (!optimizacionRutas) throw new BadMessageException(this.CAUSA_ERROR, this.MENSAJE_ERROR)
        await this.guardarRutaEquipoCache(optimizacionRutas)
        return optimizacionRutas
    }

    private async consultarRutaEquipoCache(idEquipo: number) {
        const ruta = await this.redisRepository.consultar(`ruta-${idEquipo}`)
        return ruta
    }

    private async guardarRutaEquipoCache(ruta: OptimizacionRutaEntity) {
        await this.redisRepository.guardar(ruta, `ruta-${ruta.id_equipo}`)
    }
}
