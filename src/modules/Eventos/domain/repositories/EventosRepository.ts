import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in'
import TipoEventoEntity from '../entities/TipoEventoEntity'
import EventoInesperadoEntity from '../entities/EventoInesperadoEntity'
import CondicionClimaEntity from '../entities/CondicionClimaEntity'
import CondicionTraficoEntity from '../entities/CondicionTraficoEntity'

export interface EventosRepository {
    registrarEvento(data: IRegistrarEventoIn): Promise<void>
    consultarTipoEvento(idTIpoEvento: number): Promise<TipoEventoEntity | null>
    consultarEventosInesperados(ciudad: string): Promise<EventoInesperadoEntity | null>
    consultarClima(ciudad: string): Promise<CondicionClimaEntity | null>
    consultarTrafico(ciudad: string): Promise<CondicionTraficoEntity | null>
}
