export interface IOptimizacionRutas {
    id_optimizacion: number
    id_equipo: number
    fecha_optimizacion: string
    timestamp_optimizacion: string
    estado: string
    tiempo_total_estimado_minutos: number
    distancia_total_km: number
    consumo_combustible_estimado_litros: number
    nuevo_evento: boolean
}
