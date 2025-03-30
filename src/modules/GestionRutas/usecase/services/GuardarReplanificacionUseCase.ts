import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'

import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'

export default class GuardarReplanificacionUseCase {
    private rutasRepository = DEPENDENCY_CONTAINER.get<RutasRepository>(TYPESDEPENDENCIESGLOBAL.RutasRepository)

    async execute(envios: EnvioEntity[], idEquipo: number, idOptimizacionAnterior: number): Promise<void> {
        this.registrarResultados(envios, idEquipo, idOptimizacionAnterior)
    }

    private async registrarResultados(
        enviosOrdenados: EnvioEntity[],
        idEquipo: number,
        idOptimizacionAnterior: number,
    ) {
        await this.rutasRepository.guardarRutasReplanificacion(enviosOrdenados, idEquipo, idOptimizacionAnterior)
    }
}
