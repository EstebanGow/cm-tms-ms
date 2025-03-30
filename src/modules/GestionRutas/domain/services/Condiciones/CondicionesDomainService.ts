import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository'

export default class CondicionesDomainService {
    private eventosRepository = DEPENDENCY_CONTAINER.get<EventosRepository>(TYPESDEPENDENCIES.EventosRepository)

    async consultarClima(ciudad: string): Promise<CondicionClimaEntity | null> {
        const clima = await this.eventosRepository.consultarClima(ciudad)
        return clima
    }

    async consultarTrafico(ciudad: string): Promise<CondicionTraficoEntity | null> {
        const trafico = await this.eventosRepository.consultarTrafico(ciudad)
        return trafico
    }

    async consultarEventosInesperados(ciudad: string): Promise<EventoInesperadoEntity | null> {
        const eventosInesperados = await this.eventosRepository.consultarEventosInesperados(ciudad)
        return eventosInesperados
    }
}
