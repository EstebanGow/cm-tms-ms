import { injectable } from 'inversify'
import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import { IOrdenamientoStrategy } from '../models/IOrdenamientoStrategy'

@injectable()
export class EstrategiaFactory {
    crearEstrategiaOptima(
        clima: CondicionClimaEntity | null,
        trafico: CondicionTraficoEntity | null,
        eventosInesperados: EventoInesperadoEntity | null,
    ): IOrdenamientoStrategy {
        if (eventosInesperados) {
            return DEPENDENCY_CONTAINER.get<IOrdenamientoStrategy>(TYPESDEPENDENCIES.OrdenamientoPorEventosStrategy)
        }

        if (clima && clima.severidad > 3) {
            return DEPENDENCY_CONTAINER.get<IOrdenamientoStrategy>(TYPESDEPENDENCIES.OrdenamientoPorClimaStrategy)
        }

        if (trafico && trafico.nivel_congestion_int > 3) {
            return DEPENDENCY_CONTAINER.get<IOrdenamientoStrategy>(TYPESDEPENDENCIES.OrdenamientoPorTraficoStrategy)
        }

        return DEPENDENCY_CONTAINER.get<IOrdenamientoStrategy>(TYPESDEPENDENCIES.OrdenamientoPorTraficoStrategy)
    }
}

export default EstrategiaFactory
