import { IRegistrarEventoIn } from '@modules/Eventos/usecase/dto/in'
import TipoEventoEntity from '../entities/TipoEventoEntity'

export interface EventosRepository {
    registrarEvento(data: IRegistrarEventoIn): Promise<void>
    consultarTipoEvento(idTIpoEvento: number): Promise<TipoEventoEntity | null>
}
