export interface ICondicionClima {
    id_condicion_clima: number
    latitud: number
    longitud: number
    condicion: string
    temperatura_c: number
    humedad_porcentaje: number
    velocidad_viento_kmh: number
    visibilidad_km: number
    timestamp: string
}
