import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import EquiposDomainService from '@modules/GestionRutas/domain/services/Equipos/EquiposDomainService'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import EnviosDomainService from '@modules/GestionRutas/domain/services/Envios/EnviosDomainService'
import EstadoEnvios from '@common/enum/EstadoEnvios'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import CondicionesDomainService from '@modules/GestionRutas/domain/services/Condiciones/CondicionesDomainService'
import EstrategiaFactory from '@modules/GestionRutas/domain/strategies/EstrategiaFactory'
import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'
import OrdenadorRutas from '@modules/GestionRutas/domain/strategies/OrdenadorRutas'
import EquipoEntity from '@modules/GestionRutas/domain/entities/EquipoEntity'
import { ICondiciones } from '@modules/GestionRutas/domain/models/ICondiciones'
import { publisher } from '@infrastructure/app/events/pubsub/PubSubBatch'
import TOPICS from '@infrastructure/app/events/pubsub/Topics'

export default class PlanificarRutasUseCase {
    private equiposDomainService = DEPENDENCY_CONTAINER.get<EquiposDomainService>(
        TYPESDEPENDENCIESGLOBAL.EquiposDomainService,
    )

    private enviosDomainService = DEPENDENCY_CONTAINER.get<EnviosDomainService>(
        TYPESDEPENDENCIESGLOBAL.EnviosDomainService,
    )

    private condicionesDomainService = DEPENDENCY_CONTAINER.get<CondicionesDomainService>(
        TYPESDEPENDENCIESGLOBAL.CondicionesDomainService,
    )

    private estrategiaFactory = DEPENDENCY_CONTAINER.get<EstrategiaFactory>(TYPESDEPENDENCIESGLOBAL.EstrategiaFactory)

    private ordenadorRutas = DEPENDENCY_CONTAINER.get<OrdenadorRutas>(TYPESDEPENDENCIESGLOBAL.OrdenadorRutas)

    private readonly CAUSA_ERROR = 'Error al asignar ruta'

    private readonly ENVIOS_NO_DISPONIBLE = 'No hay envíos disponibles'

    private readonly EQUIPO_NO_EXISTE = 'El equipo solicitado no existe'

    async execute(idEquipo: number): Promise<EnvioEntity[]> {
        const equipo = await this.obtenerYValidarEquipo(idEquipo)
        const enviosPorCapacidad = await this.obtenerEnviosDisponibles(equipo)
        const condiciones = await this.obtenerCondicionesActuales(equipo.ubicacion.ciudad)
        const enviosOrdenados = this.ordenarEnvios(enviosPorCapacidad, condiciones)

        this.publicarEventoPlanificacionRuta(enviosOrdenados, idEquipo)

        return enviosOrdenados
    }

    private async obtenerYValidarEquipo(idEquipo: number) {
        const equipo = await this.equiposDomainService.consultarEquipo(idEquipo)

        if (!equipo) {
            throw new BadMessageException(this.CAUSA_ERROR, this.EQUIPO_NO_EXISTE)
        }

        this.equiposDomainService.validarEquipo(equipo)
        return equipo
    }

    private async obtenerEnviosDisponibles(equipo: EquipoEntity) {
        const envios = await this.enviosDomainService.consultarEnvios(EstadoEnvios.Pendiente, equipo.ubicacion.ciudad)

        const enviosOrdenadosPorPrioridad = this.enviosDomainService.ordenarEnviosPorPrioridad(envios)

        const enviosPorCapacidad = this.enviosDomainService.seleccionarEnviosPorCapacidad(
            enviosOrdenadosPorPrioridad,
            equipo.vehiculo,
        )

        if (enviosPorCapacidad.length === 0) {
            throw new BadMessageException(this.CAUSA_ERROR, this.ENVIOS_NO_DISPONIBLE)
        }

        return enviosPorCapacidad
    }

    private async obtenerCondicionesActuales(ciudad: string) {
        const [clima, trafico, eventosInesperados] = await Promise.all([
            this.condicionesDomainService.consultarClima(ciudad),
            this.condicionesDomainService.consultarTrafico(ciudad),
            this.condicionesDomainService.consultarEventosInesperados(ciudad),
        ])

        return { clima, trafico, eventosInesperados }
    }

    private ordenarEnvios(envios: EnvioEntity[], condiciones: ICondiciones) {
        const { clima, trafico, eventosInesperados } = condiciones

        const estrategiaOptima = this.estrategiaFactory.crearEstrategiaOptima(clima, trafico, eventosInesperados)

        this.ordenadorRutas.setStrategy(estrategiaOptima)

        return this.ordenadorRutas.ordenarEnvios(envios, clima, trafico, eventosInesperados)
    }

    private async publicarEventoPlanificacionRuta(enviosOrdenados: EnvioEntity[], idEquipo: number) {
        await publisher({ envios: enviosOrdenados, idEquipo }, TOPICS.PLANIFICACION_RUTA)
    }
}
