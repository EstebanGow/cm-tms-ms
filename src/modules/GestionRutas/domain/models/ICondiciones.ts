import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'

export interface ICondiciones {
    clima: CondicionClimaEntity | null
    trafico: CondicionTraficoEntity | null
    eventosInesperados: EventoInesperadoEntity | null
}
