import { IDetalleOptimizacionConDireccion } from './IDetalleOptimizacion'

export interface IOptimizacionRuta {
    id_optimizacion: number
    id_equipo: number
    fecha_optimizacion: string
    estado: string
    detalles_optimizacion: IDetalleOptimizacionConDireccion[]
    nuevo_evento: boolean
}
