import { ICondicionClima } from '../models/ICondicionClima'

export default class CondicionClimaEntity {
    id_condicion_clima: number

    latitud: number

    longitud: number

    condicion: string

    temperatura_c: number

    humedad_porcentaje: number

    velocidad_viento_kmh: number

    visibilidad_km: number

    timestamp: string

    severidad: number

    constructor(data: ICondicionClima) {
        this.id_condicion_clima = data.id_condicion_clima
        this.latitud = data.latitud
        this.longitud = data.longitud
        this.condicion = data.condicion
        this.temperatura_c = data.temperatura_c
        this.humedad_porcentaje = data.humedad_porcentaje
        this.velocidad_viento_kmh = data.velocidad_viento_kmh
        this.visibilidad_km = data.visibilidad_km
        this.timestamp = data.timestamp
        this.severidad = data.severidad
    }
}
