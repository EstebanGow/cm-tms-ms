import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'

import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'

export default class GuardarPlanificacionUseCase {
    private rutasRepository = DEPENDENCY_CONTAINER.get<RutasRepository>(TYPESDEPENDENCIESGLOBAL.RutasRepository)

    async execute(envios: EnvioEntity[], idEquipo: number): Promise<void> {
        this.registrarResultados(envios, idEquipo)
    }

    private async registrarResultados(enviosOrdenados: EnvioEntity[], idEquipo: number) {
        await this.rutasRepository.guardarRutas(enviosOrdenados, idEquipo)
    }
}
