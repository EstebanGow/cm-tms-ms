import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import EstadosComunes from '@common/enum/EstadosComunes'
import { RedisRepository } from '@common/repositories'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import { EquiposRepository } from '../../repositories/EquiposRepository'
import EquipoEntity from '../../entities/EquipoEntity'

export default class EquiposDomainService {
    private equiposRepository = DEPENDENCY_CONTAINER.get<EquiposRepository>(TYPESDEPENDENCIES.EquiposRepository)

    private redisRepository = DEPENDENCY_CONTAINER.get<RedisRepository>(TYPESDEPENDENCIES.RedisRepository)

    private readonly CAUSA = 'Error asignacion rutas'

    private readonly MENSAJE_ERROR_VEHICULO_INACTIVO = 'El vehiculo asignado a este equipo no esta activo'

    private readonly MENSAJE_ERROR_RUTA_ACTIVA = 'El equipo tiene una ruta activa'

    private readonly MENSAJE_ERROR_NO_RUTA_ACTIVA = 'El equipo no tiene una ruta activa'

    async consultarEquipo(idEquipo: number): Promise<EquipoEntity | null> {
        const equipo = await this.equiposRepository.obtenerEquipoPorId(idEquipo)
        return equipo
    }

    validarEquipo(data: EquipoEntity | null) {
        if (data) {
            if (data.vehiculo.estado !== EstadosComunes.ACTIVO)
                throw new BadMessageException(this.CAUSA, this.MENSAJE_ERROR_VEHICULO_INACTIVO)
            if (data.ruta_activa) throw new BadMessageException(this.CAUSA, this.MENSAJE_ERROR_RUTA_ACTIVA)
        }
    }

    validarEquipoReplanificacion(data: EquipoEntity | null) {
        if (data) {
            if (data.vehiculo.estado !== EstadosComunes.ACTIVO)
                throw new BadMessageException(this.CAUSA, this.MENSAJE_ERROR_VEHICULO_INACTIVO)
            if (!data.ruta_activa) throw new BadMessageException(this.CAUSA, this.MENSAJE_ERROR_NO_RUTA_ACTIVA)
        }
    }

    async guardarRutaEquipoCache(ruta: OptimizacionRutaEntity | null) {
        if (ruta) {
            await this.limpiarRutaANteriosCache(ruta.id_equipo)
            await this.redisRepository.guardar(ruta, `ruta-${ruta.id_equipo}`)
        }
    }

    async limpiarRutaANteriosCache(idEquipo: number) {
        await this.redisRepository.eliminar(`ruta-${idEquipo}`)
    }
}
