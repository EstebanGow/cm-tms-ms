export interface ICondicionTrafico {
    id_condicion_trafico: number
    latitud_inicio: number
    longitud_inicio: number
    latitud_fin: number
    longitud_fin: number
    nivel_congestion: string
    nivel_congestion_int: number
    velocidad_promedio_kmh: number
    tiempo_estimado_minutos: number
    timestamp: string
}
