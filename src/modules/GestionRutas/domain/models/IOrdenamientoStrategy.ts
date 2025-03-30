import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import EnvioEntity from '../entities/EnvioEntity'

export interface IOrdenamientoStrategy {
    ordenarEnvios(
        envios: EnvioEntity[],
        clima: CondicionClimaEntity | null,
        trafico: CondicionTraficoEntity | null,
        eventosInesperados: EventoInesperadoEntity | null,
    ): EnvioEntity[]
}
