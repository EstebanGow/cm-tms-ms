import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { logger } from '@common/logger'
import TYPESDEPENDENCIES from '@modules/GestionRutas/dependencies/TypesDependencies'
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository'
import { ITemplateIn } from '../dto/in'

export default class AgregarEventoUseCase {
    private templateRepository = DEPENDENCY_CONTAINER.get<EventosRepository>(TYPESDEPENDENCIES.RutasRepository)

    async execute(data: ITemplateIn): Promise<string | null> {
        logger.info('TEMPLATEUSECASE', '182946189264', data)
        return 'ok'
    }
}
