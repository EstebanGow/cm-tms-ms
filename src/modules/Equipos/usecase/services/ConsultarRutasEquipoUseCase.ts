import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import { EquiposRepository } from '@modules/GestionRutas/domain/repositories/EquiposRepository'
import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import { IEquipoIn } from '../dto/in'

export default class ConsultarRutasEquipoUseCase {
    private equiposRepository = DEPENDENCY_CONTAINER.get<EquiposRepository>(TYPESDEPENDENCIES.EquiposRepository)

    async execute(data: IEquipoIn): Promise<OptimizacionRutaEntity | null> {
        const optimizacionRutas = await this.consultarRutasEquipo(data.idEquipo)
        return optimizacionRutas
    }

    private async consultarRutasEquipo(idEquipo: number): Promise<OptimizacionRutaEntity | null> {
        const optimizacionRutas = await this.equiposRepository.obtenerRutasEquipo(idEquipo)
        if (!optimizacionRutas)
            throw new BadMessageException('Error consulta rutas', 'El equipo no tiene una ruta activa')
        return optimizacionRutas
    }
}
