import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@modules/GestionRutas/dependencies/TypesDependencies'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import EquiposDomainService from '@modules/GestionRutas/domain/services/Equipos/EquiposDomainService'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import EnviosDomainService from '@modules/GestionRutas/domain/services/Envios/EnviosDomainService'
import EstadoEnvios from '@common/enum/EstadoEnvios'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import CondicionesDomainService from '@modules/GestionRutas/domain/services/Condiciones/CondicionesDomainService'

export default class PlanificarRutasUseCase {
    private rutasRepository = DEPENDENCY_CONTAINER.get<RutasRepository>(TYPESDEPENDENCIES.RutasRepository)

    private equiposDomainService = DEPENDENCY_CONTAINER.get<EquiposDomainService>(
        TYPESDEPENDENCIESGLOBAL.EquiposDomainService,
    )

    private enviosDomainService = DEPENDENCY_CONTAINER.get<EnviosDomainService>(
        TYPESDEPENDENCIESGLOBAL.EnviosDomainService,
    )

    private condicionesDomainService = DEPENDENCY_CONTAINER.get<CondicionesDomainService>(
        TYPESDEPENDENCIESGLOBAL.CondicionesDomainService,
    )

    async execute(idEquipo: number): Promise<void> {
        const equipo = await this.equiposDomainService.consultarEquipo(idEquipo)
        if (equipo === null)
            throw new BadMessageException('Error al consultar equipo', 'El equipo solicitado no existe')

        this.equiposDomainService.validarEquipo(equipo)
        const envios = await this.enviosDomainService.consultarEnvios(EstadoEnvios.Pendiente, equipo.ubicacion.ciudad)
        const enviosOrdenadosPorPrioridad = this.enviosDomainService.ordenarEnviosPorPrioridad(envios)
        const enviosPorCapacidad = this.enviosDomainService.seleccionarEnviosPorCapacidad(
            enviosOrdenadosPorPrioridad,
            equipo.vehiculo,
        )
        console.log(enviosPorCapacidad)
        const clima = await this.condicionesDomainService.consultarClima(
            equipo.ubicacion.latitud,
            equipo.ubicacion.longitud,
        )
        const trafico = await this.condicionesDomainService.consultarTrafico(
            equipo.ubicacion.latitud,
            equipo.ubicacion.longitud,
        )
        const eventosInesperados = await this.condicionesDomainService.consultarEventosInesperados(
            equipo.ubicacion.latitud,
            equipo.ubicacion.longitud,
        )
        console.log(clima)
        console.log(trafico)
        console.log(eventosInesperados)
    }
}
