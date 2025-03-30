import { IAcuerdoServicio } from './IAcuerdoService'
import { IDireccion } from './IDireccion'

export interface IEnvio {
    id_envio: number
    id_cliente: number
    id_acuerdo_servicio: number
    id_direccion_destino: number
    fecha_creacion: string
    fecha_entrega_programada: string
    fecha_entrega_real: string
    peso_kg: number
    volumen_m3: number
    descripcion: string
    estado: string
    acuerdo_servicio: IAcuerdoServicio
    direccion_destino: IDireccion
    orden_secuencia: number
    tiempo_estimado_minutos: number
    distancia_km: number
}
