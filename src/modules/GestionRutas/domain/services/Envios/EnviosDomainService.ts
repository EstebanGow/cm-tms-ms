import { DEPENDENCY_CONTAINER } from '@common/dependencies/DependencyContainer'
import TYPESDEPENDENCIES from '@common/dependencies/TypesDependencies'
import { EnviosRepository } from '../../repositories/EnviosRepository'
import EnvioEntity from '../../entities/EnvioEntity'
import { IVehiculo } from '../../models/IVehiculo'

export default class EnviosDomainService {
    private enviosRepository = DEPENDENCY_CONTAINER.get<EnviosRepository>(TYPESDEPENDENCIES.EnviosRepository)

    async consultarEnvios(estado: string, ciudad: string): Promise<EnvioEntity[] | null> {
        const envios = await this.enviosRepository.consultarEnvios(estado, ciudad)
        return envios
    }

    async consultarEnviosOptimizacion(idOprimizacion: number): Promise<EnvioEntity[] | null> {
        const enviosOptimizacion = await this.enviosRepository.consultarEnviosOptimizacion(idOprimizacion)
        return enviosOptimizacion
    }

    ordenarEnviosPorPrioridad(envios: EnvioEntity[] | null) {
        if (!envios) return []
        const mapaPrioridades: Record<string, number> = {
            Crítica: 4,
            Alta: 3,
            Media: 2,
            Baja: 1,
        }

        const enviosOrdenados = [...envios]

        const resultado = enviosOrdenados.sort((a, b) => {
            const prioridadA = mapaPrioridades[a.acuerdo_servicio.prioridad]
            const prioridadB = mapaPrioridades[b.acuerdo_servicio.prioridad]

            if (prioridadA !== prioridadB) {
                const valorA = prioridadA || 0
                const valorB = prioridadB || 0
                return valorB - valorA
            }

            if (prioridadA >= 3) {
                const fechaA = new Date(a.fecha_entrega_programada).getTime()
                const fechaB = new Date(b.fecha_entrega_programada).getTime()
                return fechaA - fechaB
            }

            return 0
        })

        return resultado.map((envio, index) => ({
            ...envio,
            orden_secuencia: index + 1,
        }))
    }

    seleccionarEnviosPorCapacidad(envios: EnvioEntity[], vehiculo: IVehiculo) {
        return envios.reduce(
            (acumulador, envio) => {
                const { seleccionados, pesoActual, volumenActual } = acumulador

                if (
                    pesoActual + envio.peso_kg <= vehiculo.capacidad_kg &&
                    volumenActual + envio.volumen_m3 <= vehiculo.capacidad_volumen_m3
                ) {
                    return {
                        seleccionados: [...seleccionados, envio],
                        pesoActual: pesoActual + envio.peso_kg,
                        volumenActual: volumenActual + envio.volumen_m3,
                    }
                }

                return acumulador
            },
            {
                seleccionados: [] as EnvioEntity[],
                pesoActual: 0,
                volumenActual: 0,
            },
        ).seleccionados
    }
}
