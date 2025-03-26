import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository'
import validarCoordenadas from '@common/util/CoordenadasUtil'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import TYPESDEPENDENCIES from '@modules/Eventos/dependencies/TypesDependencies'
import { IRegistrarEventoIn } from '../dto/in'

export default class AgregarEventoUseCase {
    private eventosRepository = DEPENDENCY_CONTAINER.get<EventosRepository>(TYPESDEPENDENCIES.EventosRepository)

    async execute(data: IRegistrarEventoIn): Promise<void> {
        const validacionCoordenadas = validarCoordenadas(data.latitud, data.longitud)
        if (!validacionCoordenadas)
            throw new BadMessageException('Error al guardar evento', 'Las coordenadas suministradas no son correctas')
        await this.consultarTiposEvento(data.idTipoEvento)
        await this.eventosRepository.registrarEvento(data)
    }

    private async consultarTiposEvento(idTIpoEvento: number): Promise<void> {
        const tipoEvento = await this.eventosRepository.consultarTipoEvento(idTIpoEvento)
        if (!tipoEvento) throw new BadMessageException('Error al guardar evento', 'El tipo de evento no existe')
    }
}
