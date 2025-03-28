import { IEventoInesperado } from '../models/IEventoInesperado'

export default class EventoInesperadoEntity {
    id_evento: number

    id_tipo_evento: number

    descripcion: string

    latitud: number

    longitud: number

    radio_afectacion_km: number

    fecha_inicio: string

    fecha_fin: string

    estado: string

    constructor(data: IEventoInesperado) {
        this.id_evento = data.id_evento
        this.id_tipo_evento = data.id_tipo_evento
        this.descripcion = data.descripcion
        this.latitud = data.latitud
        this.longitud = data.longitud
        this.radio_afectacion_km = data.radio_afectacion_km
        this.fecha_inicio = data.fecha_inicio
        this.fecha_fin = data.fecha_fin
        this.estado = data.estado
    }
}
