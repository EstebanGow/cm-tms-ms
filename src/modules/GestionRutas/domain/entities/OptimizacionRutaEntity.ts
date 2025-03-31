import { IOptimizacionRutas } from '../models/IOptimizacionRuta'

export default class OptimizacionRutasEntity {
    id_optimizacion: number

    id_equipo: number

    fecha_optimizacion: string

    timestamp_optimizacion: string

    estado: string

    tiempo_total_estimado_minutos: number

    distancia_total_km: number

    consumo_combustible_estimado_litros: number

    nuevo_evento: boolean

    constructor(data: IOptimizacionRutas) {
        this.id_optimizacion = data.id_optimizacion
        this.id_equipo = data.id_equipo
        this.fecha_optimizacion = data.fecha_optimizacion
        this.timestamp_optimizacion = data.timestamp_optimizacion
        this.estado = data.estado
        this.tiempo_total_estimado_minutos = data.tiempo_total_estimado_minutos
        this.distancia_total_km = data.distancia_total_km
        this.consumo_combustible_estimado_litros = data.consumo_combustible_estimado_litros
        this.nuevo_evento = data.nuevo_evento
    }
}
