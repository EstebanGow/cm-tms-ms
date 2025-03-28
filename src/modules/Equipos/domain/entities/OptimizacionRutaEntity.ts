import { IOptimizacionRuta } from '../models/IOptimizacionRuta'
import { IDetalleOptimizacion } from '../models/IDetalleOptimizacion'
import { IDireccion } from '../models/IDireccion'
import { IEquipo } from '../models/IEquipo'

interface IDetalleOptimizacionConDireccion extends IDetalleOptimizacion {
    direccion: IDireccion
}

export default class OptimizacionRutaEntity {
    id_optimizacion: number

    id_equipo: number

    fecha_optimizacion: string

    estado: string

    detalles_optimizacion: IDetalleOptimizacionConDireccion[]

    info_equipo: IEquipo

    constructor(data: IOptimizacionRuta) {
        this.id_optimizacion = data.id_optimizacion
        this.id_equipo = data.id_equipo
        this.fecha_optimizacion = data.fecha_optimizacion
        this.estado = data.estado
        this.detalles_optimizacion = data.detalles_optimizacion
        this.info_equipo = data.info_equipo
    }
}
