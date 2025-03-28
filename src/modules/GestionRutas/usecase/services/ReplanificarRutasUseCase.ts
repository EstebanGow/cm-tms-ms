import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { logger } from '@common/logger'
import TYPESDEPENDENCIES from '@modules/GestionRutas/dependencies/TypesDependencies'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'

export default class ReplanificarRutasUseCase {
    private templateRepository = DEPENDENCY_CONTAINER.get<RutasRepository>(TYPESDEPENDENCIES.RutasRepository)

    async execute(data: object): Promise<string | null> {
        logger.info('TEMPLATEUSECASE', '182946189264', data)
        return 'ok'
    }
}
