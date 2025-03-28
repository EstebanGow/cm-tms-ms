import { IDetalleOptimizacionConDireccion } from './IDetalleOptimizacion'
import { IEquipo } from './IEquipo'

export interface IOptimizacionRuta {
    id_optimizacion: number
    id_equipo: number
    fecha_optimizacion: string
    estado: string
    detalles_optimizacion: IDetalleOptimizacionConDireccion[]
    info_equipo: IEquipo
}
