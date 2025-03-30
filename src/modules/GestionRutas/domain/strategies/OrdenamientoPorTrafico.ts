import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import { injectable } from 'inversify'
import EnvioEntity from '../entities/EnvioEntity'
import { IOrdenamientoStrategy } from '../models/IOrdenamientoStrategy'

@injectable()
export class OrdenamientoPorTrafico implements IOrdenamientoStrategy {
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

    private calcularImpactoTrafico(envio: EnvioEntity, trafico: CondicionTraficoEntity): number {
        if (!trafico) {
            return 0
        }

        let impacto = trafico.tiempo_estimado_minutos

        const factorCongestion = 1 + trafico.nivel_congestion_int / 5

        let factorVelocidad = 1.0
        if (trafico.velocidad_promedio_kmh && trafico.velocidad_promedio_kmh > 0) {
            factorVelocidad = Math.min(60 / trafico.velocidad_promedio_kmh, 3)
        }

        const factorZona = this.estaEnZonaDeTrafico(envio, trafico) ? 1.5 : 1.0

        impacto = impacto * factorCongestion * factorVelocidad * factorZona

        return impacto
    }

    private estaEnZonaDeTrafico(envio: EnvioEntity, trafico: CondicionTraficoEntity): boolean {
        if (!envio.direccion_destino || !envio.direccion_destino.latitud || !envio.direccion_destino.longitud) {
            return false
        }

        if (!trafico.latitud_inicio || !trafico.longitud_inicio || !trafico.latitud_fin || !trafico.longitud_fin) {
            return false
        }

        const lat = envio.direccion_destino.latitud
        const lon = envio.direccion_destino.longitud

        return (
            lat >= Math.min(trafico.latitud_inicio, trafico.latitud_fin) &&
            lat <= Math.max(trafico.latitud_inicio, trafico.latitud_fin) &&
            lon >= Math.min(trafico.longitud_inicio, trafico.longitud_fin) &&
            lon <= Math.max(trafico.longitud_inicio, trafico.longitud_fin)
        )
    }
}

export default OrdenamientoPorTrafico
