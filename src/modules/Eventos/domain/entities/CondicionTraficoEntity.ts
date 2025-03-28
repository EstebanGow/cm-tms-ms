import { ICondicionTrafico } from '../models/ICondicionTrafico'

export default class CondicionTraficoEntity {
    id_condicion_trafico: number

    latitud_inicio: number

    longitud_inicio: number

    latitud_fin: number

    longitud_fin: number

    nivel_congestion: number

    velocidad_promedio_kmh: number

    tiempo_estimado_minutos: number

    timestamp: string

    constructor(data: ICondicionTrafico) {
        this.id_condicion_trafico = data.id_condicion_trafico
        this.latitud_inicio = data.latitud_inicio
        this.longitud_inicio = data.longitud_inicio
        this.latitud_fin = data.latitud_fin
        this.longitud_fin = data.longitud_fin
        this.nivel_congestion = data.nivel_congestion
        this.velocidad_promedio_kmh = data.velocidad_promedio_kmh
        this.tiempo_estimado_minutos = data.tiempo_estimado_minutos
        this.timestamp = data.timestamp
    }
}
