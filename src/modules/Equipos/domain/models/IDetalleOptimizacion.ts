import { IDireccion } from './IDireccion'

export interface IDetalleOptimizacion {
    id_envio: number
    orden_secuencia: number
    hora_estimada_llegada: string
    tiempo_estimado_siguiente_parada_minutos: number
    distancia_siguiente_parada_km: number
}

export interface IDetalleOptimizacionConDireccion extends IDetalleOptimizacion {
    direccion: IDireccion
}
