import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import EstadosComunes from '@common/enum/EstadosComunes'
import { EquiposRepository } from '../../repositories/EquiposRepository'
import EquipoEntity from '../../entities/EquipoEntity'

export default class EquiposDomainService {
    private equiposRepository = DEPENDENCY_CONTAINER.get<EquiposRepository>(TYPESDEPENDENCIES.EquiposRepository)

    async consultarEquipo(idEquipo: number): Promise<EquipoEntity | null> {
        const equipo = await this.equiposRepository.obtenerEquipoPorId(idEquipo)
        return equipo
    }

    validarEquipo(data: EquipoEntity | null) {
        if (data) {
            if (data.vehiculo.estado !== EstadosComunes.ACTIVO)
                throw new BadMessageException(
                    'Error asignacion rutas',
                    'El vehiculo asignado a este equipo no esta activo',
                )
            if (data.ruta_activa)
                throw new BadMessageException('Error asignacion rutas', 'El equipo tiene una ruta activa')
        }
    }
}
