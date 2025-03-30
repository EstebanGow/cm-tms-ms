import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import { FactorImpacto, TipoEvento } from '@common/enum/TipoEvento'
import { injectable } from 'inversify'
import calcularDistanciaHaversine from '@common/util/CalcularDistanciaUtil'
import EnvioEntity from '../entities/EnvioEntity'
import { IOrdenamientoStrategy } from '../models/IOrdenamientoStrategy'

@injectable()
export class OrdenamientoPorEventos implements IOrdenamientoStrategy {
    ordenarEnvios(
        envios: EnvioEntity[],
        _clima: CondicionClimaEntity | null,
        _trafico: CondicionTraficoEntity | null,
        eventosInesperados: EventoInesperadoEntity,
    ): EnvioEntity[] {
        const eventosActivos = this.filtrarEventosActivos([eventosInesperados])

        if (eventosActivos.length === 0) {
            return envios
        }

        const enviosConImpacto = envios.map((envio) => {
            const impactoEventos = this.calcularImpactoEventos(envio, eventosActivos)

            const envioConOrden = { ...envio }
            envioConOrden.orden_secuencia = impactoEventos

            return envioConOrden
        })

        return enviosConImpacto.sort((a, b) => a.orden_secuencia - b.orden_secuencia)
    }

    private filtrarEventosActivos(eventos: EventoInesperadoEntity[]): EventoInesperadoEntity[] {
        const ahora = new Date()

        return eventos.filter((evento) => {
            if (evento.estado.toLowerCase() !== 'activo') {
                return false
            }

            const fechaInicio = new Date(evento.fecha_inicio)
            const fechaFin = evento.fecha_fin ? new Date(evento.fecha_fin) : null

            if (fechaInicio > ahora) {
                return false
            }

            if (fechaFin && fechaFin < ahora) {
                return false
            }

            return true
        })
    }

    private calcularImpactoEventos(envio: EnvioEntity, eventos: EventoInesperadoEntity[]): number {
        if (!envio.direccion_destino || !envio.direccion_destino.latitud || !envio.direccion_destino.longitud) {
            return 0
        }

        return eventos
            .filter((evento) => evento.latitud && evento.longitud)
            .map((evento) => {
                const cercaniaEvento = this.calcularCercaniaEvento(
                    envio.direccion_destino.latitud,
                    envio.direccion_destino.longitud,
                    evento,
                )

                if (cercaniaEvento <= 0) {
                    return 0
                }

                const factorTipoEvento = this.calcularFactorTipoEvento(evento.id_tipo_evento)

                return cercaniaEvento * factorTipoEvento
            })
            .reduce((total, impacto) => total + impacto, 0)
    }

    private calcularCercaniaEvento(latDestino: number, lonDestino: number, evento: EventoInesperadoEntity): number {
        const distancia = calcularDistanciaHaversine(latDestino, lonDestino, evento.latitud, evento.longitud)

        const radioAfectacion = evento.radio_afectacion_km

        if (distancia > radioAfectacion) {
            return 0
        }

        return 1 - distancia / radioAfectacion
    }

    private calcularFactorTipoEvento(idTipoEvento: number): number {
        const factoresImpacto: Record<number, FactorImpacto> = {
            [TipoEvento.CongestionInesperada]: { nombre: 'Congestión de tráfico inesperada', valor: 6 },
            [TipoEvento.AccidenteTransito]: { nombre: 'Accidente de tránsito', valor: 8 },
            [TipoEvento.CambioBruscoClima]: { nombre: 'Cambio brusco de clima', valor: 5 },
            [TipoEvento.BloqueoVial]: { nombre: 'Bloqueo vial', valor: 7 },
            [TipoEvento.FallaMecanica]: { nombre: 'Falla mecánica', valor: 4 },
            [TipoEvento.EmergenciaMedica]: { nombre: 'Emergencia médica', valor: 9 },
            [TipoEvento.DesviioObligatorio]: { nombre: 'Desvío obligatorio', valor: 6 },
            [TipoEvento.Inundacion]: { nombre: 'Inundación', valor: 9 },
        }

        const factorDefault: FactorImpacto = { nombre: 'Evento desconocido', valor: 5 }
        const factor = factoresImpacto[idTipoEvento] || factorDefault

        return factor.valor
    }
}

export default OrdenamientoPorEventos
