import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import { injectable } from 'inversify'
import EnvioEntity from '../entities/EnvioEntity'
import { IOrdenamientoStrategy } from '../models/IOrdenamientoStrategy'

@injectable()
export class OrdenamientoPorClima implements IOrdenamientoStrategy {
    /**
     * Ordena los envíos basándose en el impacto del clima
     * @param envios Lista de envíos a ordenar
     * @param clima Condición de clima actual
     * @returns Lista de envíos ordenada por impacto del clima (menor a mayor)
     */
    ordenarEnvios(
        envios: EnvioEntity[],
        clima: CondicionClimaEntity,
        _trafico: CondicionTraficoEntity | null,
        _eventosInesperados: EventoInesperadoEntity | null,
    ): EnvioEntity[] {
        // Asignamos el número de secuencia basado en el impacto del clima
        const enviosConImpacto = envios.map((envio) => {
            const impactoClima = this.calcularImpactoClima(envio, clima)

            // Creamos una copia del envío para no modificar el original
            const envioConOrden = { ...envio }
            // Asignamos el orden de secuencia basado en el impacto
            envioConOrden.orden_secuencia = impactoClima

            return envioConOrden
        })

        // Ordenamos los envíos por el impacto del clima (menor a mayor)
        return enviosConImpacto.sort((a, b) => a.orden_secuencia - b.orden_secuencia)
    }

    /**
     * Calcula el impacto del clima para un envío específico
     * @param envio Envío a evaluar
     * @param clima Condición de clima actual
     * @returns Valor numérico que representa el impacto (mayor valor = más afectado)
     */
    private calcularImpactoClima(envio: EnvioEntity, clima: CondicionClimaEntity): number {
        // Valores iniciales de impacto
        let impacto = 0

        // Verificamos si la ruta del envío está expuesta a las condiciones climáticas
        const factorExposicion = this.calcularExposicionRuta(envio, clima)

        // Evaluamos la severidad de la condición climática
        const severidadClima = this.calcularSeveridadClima(clima)

        // Combinamos factores para el impacto total
        impacto = severidadClima * factorExposicion

        return impacto
    }

    /**
     * Determina el nivel de exposición de la ruta a las condiciones climáticas
     * @param envio Envío a evaluar
     * @param clima Condición climática a considerar
     * @returns Factor de exposición (1.0 = normal, >1.0 = mayor exposición)
     */
    private calcularExposicionRuta(envio: EnvioEntity, clima: CondicionClimaEntity): number {
        // Verificamos si tenemos información de ubicación
        if (!envio.direccion_destino || !envio.direccion_destino.latitud || !envio.direccion_destino.longitud) {
            return 1.0 // Exposición default si no hay datos
        }

        // Calculamos la distancia entre el destino y el centro de la condición climática
        const distancia = this.calcularDistanciaHaversine(
            envio.direccion_destino.latitud,
            envio.direccion_destino.longitud,
            clima.latitud,
            clima.longitud,
        )

        // Determinamos la exposición basada en la distancia
        // Cuanto más cerca, mayor exposición
        if (distancia < 1) {
            return 3.0 // Muy expuesto (menos de 1km)
        }
        if (distancia < 5) {
            return 2.0 // Moderadamente expuesto (1-5km)
        }
        if (distancia < 15) {
            return 1.5 // Ligeramente expuesto (5-15km)
        }
        return 1.0 // Exposición normal (más de 15km)
    }

    /**
     * Calcula la severidad de las condiciones climáticas
     * @param clima Condición climática a evaluar
     * @returns Valor de severidad (1-10, donde 10 es extremadamente severo)
     */
    private calcularSeveridadClima(clima: CondicionClimaEntity): number {
        let severidad = 1 // Valor base

        // Factor por tipo de condición
        switch (clima.condicion.toLowerCase()) {
            case 'lluvia':
            case 'lluvioso':
                severidad += 2
                break
            case 'nieve':
            case 'nevado':
                severidad += 4
                break
            case 'tormenta':
            case 'tormentoso':
                severidad += 5
                break
            case 'niebla':
            case 'neblina':
                severidad += 3
                break
            case 'granizo':
                severidad += 5
                break
            case 'soleado':
            case 'despejado':
                severidad += 0
                break
            case 'nublado':
                severidad += 1
                break
            default:
                severidad += 1
        }

        // Factor por visibilidad
        if (clima.visibilidad_km !== undefined) {
            if (clima.visibilidad_km < 1) {
                severidad += 4 // Visibilidad extremadamente reducida
            } else if (clima.visibilidad_km < 3) {
                severidad += 3 // Visibilidad muy reducida
            } else if (clima.visibilidad_km < 5) {
                severidad += 2 // Visibilidad reducida
            }
        }

        // Factor por velocidad del viento
        if (clima.velocidad_viento_kmh !== undefined) {
            if (clima.velocidad_viento_kmh > 80) {
                severidad += 4 // Viento extremadamente fuerte
            } else if (clima.velocidad_viento_kmh > 60) {
                severidad += 3 // Viento muy fuerte
            } else if (clima.velocidad_viento_kmh > 40) {
                severidad += 2 // Viento fuerte
            } else if (clima.velocidad_viento_kmh > 20) {
                severidad += 1 // Viento moderado
            }
        }

        // Factor por temperatura (extremos)
        if (clima.temperatura_c !== undefined) {
            if (clima.temperatura_c < 0) {
                severidad += 3 // Temperaturas bajo cero
            } else if (clima.temperatura_c < 5) {
                severidad += 2 // Temperaturas muy frías
            } else if (clima.temperatura_c > 35) {
                severidad += 2 // Temperaturas muy calientes
            }
        }

        // Factor por humedad extrema
        if (clima.humedad_porcentaje !== undefined && clima.humedad_porcentaje > 90) {
            severidad += 1 // Humedad muy alta
        }

        // Normalizamos la severidad a un máximo de 10
        return Math.min(severidad, 10)
    }

    /**
     * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
     * @param lat1 Latitud del punto 1
     * @param lon1 Longitud del punto 1
     * @param lat2 Latitud del punto 2
     * @param lon2 Longitud del punto 2
     * @returns Distancia en kilómetros
     */
    private calcularDistanciaHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        // Radio de la Tierra en kilómetros
        const R = 6371

        // Convertir latitudes y longitudes de grados a radianes
        const dLat = this.toRadians(lat2 - lat1)
        const dLon = this.toRadians(lon2 - lon1)

        // Fórmula de Haversine
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distancia = R * c

        return distancia
    }

    /**
     * Convierte grados a radianes
     * @param grados Valor en grados
     * @returns Valor en radianes
     */
    private toRadians(grados: number): number {
        return grados * (Math.PI / 180)
    }
}

export default OrdenamientoPorClima
