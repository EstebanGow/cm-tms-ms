import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in'
import TipoEventoEntity from '../entities/TipoEventoEntity'
import EventoInesperadoEntity from '../entities/EventoInesperadoEntity'
import CondicionClimaEntity from '../entities/CondicionClimaEntity'
import CondicionTraficoEntity from '../entities/CondicionTraficoEntity'

export interface EventosRepository {
    registrarEvento(data: IRegistrarEventoIn): Promise<void>
    consultarTipoEvento(idTIpoEvento: number): Promise<TipoEventoEntity | null>
    consultarEventosInesperados(latitud: number, longitud: number): Promise<EventoInesperadoEntity | null>
    consultarClima(latitud: number, longitud: number): Promise<CondicionClimaEntity | null>
    consultarTrafico(latitud: number, longitud: number): Promise<CondicionTraficoEntity | null>
}
