import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { logger } from '@common/logger'
import TYPESDEPENDENCIES from '@modules/GestionRutas/dependencies/TypesDependencies'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import { ITemplateIn } from '../dto/in'

export default class PlanificarRutasUseCase {
    private templateRepository = DEPENDENCY_CONTAINER.get<RutasRepository>(TYPESDEPENDENCIES.RutasRepository)

    async execute(data: ITemplateIn): Promise<string | null> {
        logger.info('TEMPLATEUSECASE', '182946189264', data)
        return 'ok'
    }
}
