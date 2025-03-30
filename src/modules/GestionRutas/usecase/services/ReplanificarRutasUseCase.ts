import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import BadMessageException from '@common/http/exceptions/BadMessageException'
import { RutasRepository } from '@modules/GestionRutas/domain/repositories/RutasRepository'
import EquiposDomainService from '@modules/GestionRutas/domain/services/Equipos/EquiposDomainService'
import TYPESDEPENDENCIESGLOBAL from '@common/dependencies/TypesDependencies'
import EnviosDomainService from '@modules/GestionRutas/domain/services/Envios/EnviosDomainService'
import CondicionesDomainService from '@modules/GestionRutas/domain/services/Condiciones/CondicionesDomainService'
import EstrategiaFactory from '@modules/GestionRutas/domain/strategies/EstrategiaFactory'
import OrdenadorRutas from '@modules/GestionRutas/domain/strategies/OrdenadorRutas'
import EnvioEntity from '@modules/GestionRutas/domain/entities/EnvioEntity'
import EquipoEntity from '@modules/GestionRutas/domain/entities/EquipoEntity'
import { ICondiciones } from '@modules/GestionRutas/domain/models/ICondiciones'
import { publisher } from '@infrastructure/app/events/pubsub/PubSubBatch'

export default class ReplanificarRutasUseCase {
    private rutasRepository = DEPENDENCY_CONTAINER.get<RutasRepository>(TYPESDEPENDENCIESGLOBAL.RutasRepository)

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

    async execute(idEquipo: number): Promise<EnvioEntity[]> {
        const equipo = await this.obtenerYValidarEquipo(idEquipo)
        const enviosEquipo = await this.consultarEnviosOptimizacion(equipo)
        const condiciones = await this.obtenerCondicionesActuales(equipo.ubicacion.ciudad)
        const enviosOrdenados = this.ordenarEnvios(enviosEquipo, condiciones)
        this.registrarResultados(enviosOrdenados, idEquipo, equipo.ruta_activa)

        return enviosOrdenados
    }

    private async obtenerYValidarEquipo(idEquipo: number) {
        const equipo = await this.equiposDomainService.consultarEquipo(idEquipo)

        if (!equipo) {
            throw new BadMessageException('Error al consultar equipo', 'El equipo solicitado no existe')
        }

        this.equiposDomainService.validarEquipoReplanificacion(equipo)
        return equipo
    }

    private async consultarEnviosOptimizacion(equipo: EquipoEntity) {
        const envios = await this.enviosDomainService.consultarEnviosOptimizacion(equipo.ruta_activa)

        if (envios && envios.length === 0) {
            throw new BadMessageException('Error al replanificar la ruta', 'No hay envíos disponibles')
        }
        const enviosOrdenadosPorPrioridad = this.enviosDomainService.ordenarEnviosPorPrioridad(envios)

        return enviosOrdenadosPorPrioridad
    }

    private async obtenerCondicionesActuales(ciudad: string) {
        const eventosInesperados = await this.condicionesDomainService.consultarEventosInesperados(ciudad)

        return { clima: null, trafico: null, eventosInesperados }
    }

    private ordenarEnvios(enviosPorCapacidad: EnvioEntity[], condiciones: ICondiciones) {
        const { clima, trafico, eventosInesperados } = condiciones

        const estrategiaOptima = this.estrategiaFactory.crearEstrategiaOptima(clima, trafico, eventosInesperados)

        this.ordenadorRutas.setStrategy(estrategiaOptima)

        return this.ordenadorRutas.ordenarEnvios(enviosPorCapacidad, clima, trafico, eventosInesperados)
    }

    private async registrarResultados(
        enviosOrdenados: EnvioEntity[],
        idEquipo: number,
        idOptimizacionAnterior: number,
    ) {
        await publisher({ envios: enviosOrdenados, idEquipo, idOptimizacionAnterior }, 'esteban-replanificacion-ruta')
    }
}
