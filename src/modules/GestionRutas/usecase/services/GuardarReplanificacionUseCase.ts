import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'

import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'
import EquiposDomainService from '@modules/GestionRutas/domain/services/Equipos/EquiposDomainService'
import { IGuardarReplanificacion } from '../dto/in/IGuardarPlanificacion'

export default class GuardarReplanificacionUseCase {
    private rutasRepository = DEPENDENCY_CONTAINER.get<RutasRepository>(TYPESDEPENDENCIESGLOBAL.RutasRepository)

    private equipoDomainService = DEPENDENCY_CONTAINER.get<EquiposDomainService>(
        TYPESDEPENDENCIESGLOBAL.EquiposDomainService,
    )

    async execute(data: IGuardarReplanificacion): Promise<void> {
        const { envios, idEquipo, idOptimizacionAnterior, idEvento } = data
        await this.registrarResultados(envios, idEquipo, idOptimizacionAnterior, idEvento)
        await this.asignarRutaEquipoCache(idEquipo)
    }

    private async registrarResultados(
        enviosOrdenados: EnvioEntity[],
        idEquipo: number,
        idOptimizacionAnterior: number,
        idEvento: number,
    ) {
        await this.rutasRepository.guardarRutasReplanificacion(
            enviosOrdenados,
            idEquipo,
            idOptimizacionAnterior,
            idEvento,
        )
    }

    private async asignarRutaEquipoCache(idEquipo: number) {
        const rutaEquipo = await this.rutasRepository.obtenerRutasEquipo(idEquipo)
        await this.equipoDomainService.guardarRutaEquipoCache(rutaEquipo)
    }
}
