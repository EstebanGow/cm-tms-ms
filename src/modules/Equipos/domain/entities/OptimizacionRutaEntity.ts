import { IDetalleOptimizacion } from '../models/IDetalleOptimizacion'
import { IDireccion } from '../models/IDireccion'
import { IOptimizacionRuta } from '../models/IOptimizacionRuta'

interface IDetalleOptimizacionConDireccion extends IDetalleOptimizacion {
    direccion: IDireccion
}

export default class OptimizacionRutaEntity {
    id_optimizacion: number

    id_equipo: number

    fecha_optimizacion: string

    estado: string

    detalles_optimizacion: IDetalleOptimizacionConDireccion[]

    nuevo_evento: boolean

    constructor(data: IOptimizacionRuta) {
        this.id_optimizacion = data.id_optimizacion
        this.id_equipo = data.id_equipo
        this.fecha_optimizacion = data.fecha_optimizacion
        this.estado = data.estado
        this.detalles_optimizacion = data.detalles_optimizacion
        this.nuevo_evento = data.nuevo_evento
    }
}
