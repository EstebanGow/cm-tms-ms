import { IAcuerdoServicio } from '../models/IAcuerdoService'
import { IDireccion } from '../models/IDireccion'
import { IEnvio } from '../models/IEnvio'

export default class EnvioEntity {
    id_envio: number

    id_cliente: number

    id_acuerdo_servicio: number

    id_direccion_destino: number

    fecha_creacion: string

    fecha_entrega_programada: string

    fecha_entrega_real: string | null

    peso_kg: number

    volumen_m3: number

    descripcion: string

    estado: string

    acuerdo_servicio: IAcuerdoServicio

    direccion_destino: IDireccion

    orden_secuencia: number

    tiempo_estimado_minutos: number

    distancia_km: number

    constructor(data: IEnvio) {
        this.id_envio = data.id_envio
        this.id_cliente = data.id_cliente
        this.id_acuerdo_servicio = data.id_acuerdo_servicio
        this.id_direccion_destino = data.id_direccion_destino
        this.fecha_creacion = data.fecha_creacion
        this.fecha_entrega_programada = data.fecha_entrega_programada
        this.fecha_entrega_real = data.fecha_entrega_real
        this.peso_kg = data.peso_kg
        this.volumen_m3 = data.volumen_m3
        this.descripcion = data.descripcion
        this.estado = data.estado
        this.acuerdo_servicio = data.acuerdo_servicio
        this.direccion_destino = data.direccion_destino
        this.orden_secuencia = 0
        this.tiempo_estimado_minutos = 0
        this.distancia_km = 0
    }
}
