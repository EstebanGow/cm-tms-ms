import EventoInesperadoEntity from '@modules/Eventos/domain/entities/EventoInesperadoEntity'
import CondicionClimaEntity from '@modules/Eventos/domain/entities/CondicionClimaEntity'
import CondicionTraficoEntity from '@modules/Eventos/domain/entities/CondicionTraficoEntity'
import { FactorImpacto, TipoEvento } from '@common/enum/TipoEvento'
import { injectable } from 'inversify'
import EnvioEntity from '../entities/EnvioEntity'
import { IOrdenamientoStrategy } from '../models/IOrdenamientoStrategy'

@injectable()
export class OrdenamientoPorEventos implements IOrdenamientoStrategy {
    /**
     * Ordena los envíos basándose en el impacto de eventos inesperados
     * @param envios Lista de envíos a ordenar
     * @param eventosInesperados Lista de eventos inesperados activos
     * @returns Lista de envíos ordenada por impacto de eventos (menor a mayor)
     */
    ordenarEnvios(
        envios: EnvioEntity[],
        _clima: CondicionClimaEntity | null,
        _trafico: CondicionTraficoEntity | null,
        eventosInesperados: EventoInesperadoEntity,
    ): EnvioEntity[] {
        // Filtramos eventos activos (verificando fechas y estado)
        const eventosActivos = this.filtrarEventosActivos([eventosInesperados])

        if (eventosActivos.length === 0) {
            return envios // No hay eventos activos, mantenemos el orden original
        }

        // Asignamos el número de secuencia basado en el impacto de los eventos
        const enviosConImpacto = envios.map((envio) => {
            const impactoEventos = this.calcularImpactoEventos(envio, eventosActivos)

            // Creamos una copia del envío para no modificar el original
            const envioConOrden = { ...envio }
            // Asignamos el orden de secuencia basado en el impacto
            envioConOrden.orden_secuencia = impactoEventos

            return envioConOrden
        })

        // Ordenamos los envíos por el impacto de eventos (menor a mayor)
        return enviosConImpacto.sort((a, b) => a.orden_secuencia - b.orden_secuencia)
    }

    /**
     * Filtra los eventos para obtener solo los que están activos actualmente
     * @param eventos Lista de todos los eventos inesperados
     * @returns Lista de eventos activos
     */
    private filtrarEventosActivos(eventos: EventoInesperadoEntity[]): EventoInesperadoEntity[] {
        const ahora = new Date()

        return eventos.filter((evento) => {
            // Verificamos que el estado sea activo
            if (evento.estado.toLowerCase() !== 'activo') {
                return false
            }

            // Verificamos que el evento esté dentro del rango de fechas
            const fechaInicio = new Date(evento.fecha_inicio)
            const fechaFin = evento.fecha_fin ? new Date(evento.fecha_fin) : null

            if (fechaInicio > ahora) {
                return false // El evento aún no ha comenzado
            }

            if (fechaFin && fechaFin < ahora) {
                return false // El evento ya ha terminado
            }

            return true
        })
    }

    /**
     * Calcula el impacto total de los eventos inesperados para un envío específico
     * @param envio Envío a evaluar
     * @param eventos Lista de eventos inesperados activos
     * @returns Valor numérico que representa el impacto (mayor valor = más afectado)
     */
    private calcularImpactoEventos(envio: EnvioEntity, eventos: EventoInesperadoEntity[]): number {
        // Si no hay información de destino, no podemos calcular el impacto
        if (!envio.direccion_destino || !envio.direccion_destino.latitud || !envio.direccion_destino.longitud) {
            return 0
        }

        // Calculamos el impacto de cada evento y sumamos usando métodos funcionales
        return eventos
            .filter((evento) => evento.latitud && evento.longitud)
            .map((evento) => {
                // Calculamos la cercanía del evento al destino del envío
                const cercaniaEvento = this.calcularCercaniaEvento(
                    envio.direccion_destino.latitud,
                    envio.direccion_destino.longitud,
                    evento,
                )

                // Si no hay cercanía relevante, retornamos impacto cero
                if (cercaniaEvento <= 0) {
                    return 0
                }

                // Factor de impacto basado en el tipo de evento
                const factorTipoEvento = this.calcularFactorTipoEvento(evento.id_tipo_evento)

                // Retornamos el impacto de este evento
                return cercaniaEvento * factorTipoEvento
            })
            .reduce((total, impacto) => total + impacto, 0)
    }

    /**
     * Calcula qué tan cerca está un evento del destino de un envío
     * @param latDestino Latitud del destino del envío
     * @param lonDestino Longitud del destino del envío
     * @param evento Evento inesperado a evaluar
     * @returns Factor de cercanía (0 = no afecta, >0 = afecta proporcionalmente)
     */
    private calcularCercaniaEvento(latDestino: number, lonDestino: number, evento: EventoInesperadoEntity): number {
        // Calculamos la distancia entre el destino y el evento
        const distancia = this.calcularDistanciaHaversine(latDestino, lonDestino, evento.latitud, evento.longitud)

        // Verificamos si el destino está dentro del radio de afectación del evento
        const radioAfectacion = evento.radio_afectacion_km || 1 // Default de 1km si no está definido

        if (distancia > radioAfectacion) {
            return 0 // El destino está fuera del radio de afectación
        }

        // Calculamos un factor de cercanía inversamente proporcional a la distancia
        // (más cerca = mayor impacto)
        return 1 - distancia / radioAfectacion
    }

    /**
     * Asigna un factor de impacto según el tipo de evento
     * @param idTipoEvento ID del tipo de evento
     * @returns Factor de impacto (1-10, donde 10 es el máximo impacto)
     */
    private calcularFactorTipoEvento(idTipoEvento: number): number {
        // Mapeo de tipos de eventos a sus factores de impacto
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

        // Obtenemos el factor o usamos un valor predeterminado
        const factorDefault: FactorImpacto = { nombre: 'Evento desconocido', valor: 5 }
        const factor = factoresImpacto[idTipoEvento] || factorDefault

        return factor.valor
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

export default OrdenamientoPorEventos
