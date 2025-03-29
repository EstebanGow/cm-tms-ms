import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import { EventosRepository } from '@modules/Eventos/domain/repositories/EventosRepository'
import validarCoordenadas from '@common/util/CoordenadasUtil'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import GeolocalizacionDomainService from '@modules/Eventos/domain/services/GeolocalizacionDomainService'
import { IRegistrarEventoIn } from '../dto/in'

export default class AgregarEventoUseCase {
    private eventosRepository = DEPENDENCY_CONTAINER.get<EventosRepository>(TYPESDEPENDENCIES.EventosRepository)

    private geolocalizacionDomainService = DEPENDENCY_CONTAINER.get<GeolocalizacionDomainService>(
        TYPESDEPENDENCIES.GeolocalizacionDomainService,
    )

    async execute(data: IRegistrarEventoIn): Promise<void> {
        validarCoordenadas(data.latitud, data.longitud)
        await this.geolocalizacionDomainService.validarCoordenadasGeolocalizacion(
            data.latitud,
            data.longitud,
            data.ciudad,
        )
        await this.validartipoEvento(data.idTipoEvento)
        await this.eventosRepository.registrarEvento(data)
    }

    private async validartipoEvento(idTIpoEvento: number): Promise<void> {
        const tipoEvento = await this.eventosRepository.consultarTipoEvento(idTIpoEvento)
        if (!tipoEvento) throw new BadMessageException('Error al consultar evento', 'El tipo de evento no existe')
    }
}
