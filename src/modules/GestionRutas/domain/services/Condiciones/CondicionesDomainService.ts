import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository'

export default class CondicionesDomainService {
    private eventosRepository = DEPENDENCY_CONTAINER.get<EventosRepository>(TYPESDEPENDENCIES.EventosRepository)

    async consultarClima(clientId: string): Promise<void> {
        console.log(clientId)
    }

    async consultarTrafico(clientId: string): Promise<void> {
        console.log(clientId)
    }

    async consultarEventosInesperados(clientId: string): Promise<void> {
        console.log(clientId)
    }
}
