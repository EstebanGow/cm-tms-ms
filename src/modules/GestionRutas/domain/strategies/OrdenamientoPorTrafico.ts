import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import { injectable } from 'inversify'
import EnvioEntity from '../entities/EnvioEntity'
import { IOrdenamientoStrategy } from '../models/IOrdenamientoStrategy'

@injectable()
export class OrdenamientoPorTrafico implements IOrdenamientoStrategy {
    /**
     * Ordena los envíos basándose en el impacto del tráfico
     * @param envios Lista de envíos a ordenar
     * @param trafico Condición de tráfico actual
     * @returns Lista de envíos ordenada por impacto de tráfico (menor a mayor)
     */
    ordenarEnvios(
        envios: EnvioEntity[],
        _clima: CondicionClimaEntity | null,
        trafico: CondicionTraficoEntity,
        _eventosInesperados: EventoInesperadoEntity | null,
    ): EnvioEntity[] {
        return [...envios].sort((a, b) => {
            const impactoTraficoA = this.calcularImpactoTrafico(a, trafico)
            const impactoTraficoB = this.calcularImpactoTrafico(b, trafico)

            return impactoTraficoA - impactoTraficoB
        })
    }

    /**
     * Calcula el impacto del tráfico para un envío específico
     * @param envio Envío a evaluar
     * @param trafico Condición de tráfico actual
     * @returns Valor numérico que representa el impacto (mayor valor = más afectado)
     */
    private calcularImpactoTrafico(envio: EnvioEntity, trafico: CondicionTraficoEntity): number {
        if (!trafico) {
            return 0
        }

        // Base del impacto: tiempo estimado en tráfico
        let impacto = trafico.tiempo_estimado_minutos

        // Factor de nivel de congestión (1.0 a 3.0)
        const factorCongestion = 1 + trafico.nivel_congestion_int / 5

        // Factor de velocidad - velocidades menores aumentan el impacto
        let factorVelocidad = 1.0
        if (trafico.velocidad_promedio_kmh && trafico.velocidad_promedio_kmh > 0) {
            // Velocidad de referencia: 60 km/h
            factorVelocidad = Math.min(60 / trafico.velocidad_promedio_kmh, 3)
        }

        // Verificamos si el envío está en la zona afectada por el tráfico
        const factorZona = this.estaEnZonaDeTrafico(envio, trafico) ? 1.5 : 1.0

        // Combinamos todos los factores
        impacto = impacto * factorCongestion * factorVelocidad * factorZona

        return impacto
    }

    /**
     * Verifica si un envío está dentro de la zona geográfica afectada por el tráfico
     * @param envio Envío a verificar
     * @param trafico Condición de tráfico con coordenadas de la zona afectada
     * @returns true si el destino del envío está en la zona afectada
     */
    private estaEnZonaDeTrafico(envio: EnvioEntity, trafico: CondicionTraficoEntity): boolean {
        // Verificamos que tengamos datos de coordenadas en el destino
        if (!envio.direccion_destino || !envio.direccion_destino.latitud || !envio.direccion_destino.longitud) {
            return false
        }

        // Verificamos que tengamos las coordenadas de la zona de tráfico
        if (!trafico.latitud_inicio || !trafico.longitud_inicio || !trafico.latitud_fin || !trafico.longitud_fin) {
            return false
        }

        const lat = envio.direccion_destino.latitud
        const lon = envio.direccion_destino.longitud

        // Verificamos si el destino está dentro del rectángulo definido por las coordenadas
        return (
            lat >= Math.min(trafico.latitud_inicio, trafico.latitud_fin) &&
            lat <= Math.max(trafico.latitud_inicio, trafico.latitud_fin) &&
            lon >= Math.min(trafico.longitud_inicio, trafico.longitud_fin) &&
            lon <= Math.max(trafico.longitud_inicio, trafico.longitud_fin)
        )
    }
}

export default OrdenamientoPorTrafico
