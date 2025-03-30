import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import { injectable } from 'inversify'
import ExposicionRuta, { DistanciaAfectacionKm } from '@common/enum/ExposicionRuta'
import calcularDistanciaHaversine from '@common/util/CalcularDistanciaUtil'
import EnvioEntity from '../entities/EnvioEntity'
import { IOrdenamientoStrategy } from '../models/IOrdenamientoStrategy'

@injectable()
export class OrdenamientoPorClima implements IOrdenamientoStrategy {
    private readonly SEVERIDAD_BASE = 1

    private readonly SEVERIDAD_MAXIMA = 10

    private readonly SEVERIDAD_POR_CONDICION: Record<string, number> = {
        lluvia: 2,
        lluvioso: 2,
        nieve: 4,
        nevado: 4,
        tormenta: 5,
        tormentoso: 5,
        niebla: 3,
        neblina: 3,
        granizo: 5,
        soleado: 0,
        despejado: 0,
        nublado: 1,
    }

    ordenarEnvios(
        envios: EnvioEntity[],
        clima: CondicionClimaEntity,
        _trafico: CondicionTraficoEntity | null,
        _eventosInesperados: EventoInesperadoEntity | null,
    ): EnvioEntity[] {
        const enviosConImpacto = envios.map((envio) => {
            const impactoClima = this.calcularImpactoClima(envio, clima)

            const envioConOrden = { ...envio }
            envioConOrden.orden_secuencia = impactoClima

            return envioConOrden
        })

        return enviosConImpacto.sort((a, b) => a.orden_secuencia - b.orden_secuencia)
    }

    private calcularImpactoClima(envio: EnvioEntity, clima: CondicionClimaEntity): number {
        let impacto = 0

        const factorExposicion = this.calcularExposicionRuta(envio, clima)

        const severidadClima = this.calcularSeveridadClima(clima)

        impacto = severidadClima * factorExposicion

        return impacto
    }

    private calcularExposicionRuta(envio: EnvioEntity, clima: CondicionClimaEntity): number {
        if (!envio.direccion_destino || !envio.direccion_destino.latitud || !envio.direccion_destino.longitud) {
            return ExposicionRuta.LIGERO
        }

        const distancia = calcularDistanciaHaversine(
            envio.direccion_destino.latitud,
            envio.direccion_destino.longitud,
            clima.latitud,
            clima.longitud,
        )

        if (distancia < DistanciaAfectacionKm.MUY_EXPUESTO) {
            return ExposicionRuta.MUY_EXPUESTO
        }
        if (distancia < DistanciaAfectacionKm.MODERADAMENTE_EXPUESTO) {
            return ExposicionRuta.MODERADAMENTE_EXPUESTO
        }
        if (distancia < DistanciaAfectacionKm.LIGERO) {
            return ExposicionRuta.LIGERO
        }
        return ExposicionRuta.LIGERO
    }

    private calcularSeveridadPorCondicion(clima: CondicionClimaEntity): number {
        const condicionNormalizada = clima.condicion.toLowerCase()
        return this.SEVERIDAD_POR_CONDICION[condicionNormalizada] || 1
    }

    private calcularSeveridadPorVisibilidad(clima: CondicionClimaEntity): number {
        if (clima.visibilidad_km === undefined) return 0
        if (clima.visibilidad_km < 1) return 4
        if (clima.visibilidad_km < 3) return 3
        if (clima.visibilidad_km < 5) return 2

        return 0
    }

    private calcularSeveridadPorViento(clima: CondicionClimaEntity): number {
        if (clima.velocidad_viento_kmh === undefined) return 0
        if (clima.velocidad_viento_kmh > 80) return 4
        if (clima.velocidad_viento_kmh > 60) return 3
        if (clima.velocidad_viento_kmh > 40) return 2
        if (clima.velocidad_viento_kmh > 20) return 1

        return 0
    }

    private calcularSeveridadPorTemperatura(clima: CondicionClimaEntity): number {
        if (clima.temperatura_c === undefined) return 0
        if (clima.temperatura_c < 0) return 3
        if (clima.temperatura_c < 5) return 2
        if (clima.temperatura_c > 35) return 2

        return 0
    }

    private calcularSeveridadPorHumedad(clima: CondicionClimaEntity): number {
        if (clima.humedad_porcentaje === undefined) return 0

        return clima.humedad_porcentaje > 90 ? 1 : 0
    }

    private calcularSeveridadClima(clima: CondicionClimaEntity): number {
        const calculadoresSeveridad = [
            this.calcularSeveridadPorCondicion,
            this.calcularSeveridadPorVisibilidad,
            this.calcularSeveridadPorViento,
            this.calcularSeveridadPorTemperatura,
            this.calcularSeveridadPorHumedad,
        ]

        const severidadTotal =
            this.SEVERIDAD_BASE + calculadoresSeveridad.reduce((total, calculador) => total + calculador(clima), 0)

        return Math.min(severidadTotal, this.SEVERIDAD_MAXIMA)
    }
}

export default OrdenamientoPorClima
