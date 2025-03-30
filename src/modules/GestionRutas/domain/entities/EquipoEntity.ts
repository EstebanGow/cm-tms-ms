import { IConductor } from '../models/IConductor'
import { IVehiculo } from '../models/IVehiculo'
import { IUbicacionGPS } from '../models/IUbicacionGPS'
import { IEquipo } from '../models/IEquipo'

export default class EquipoEntity {
    id_equipo: number

    id_conductor: number

    id_vehiculo: number

    fecha_asignacion: string

    estado: string

    ruta_activa: number

    conductor: IConductor

    vehiculo: IVehiculo

    ubicacion: IUbicacionGPS

    constructor(data: IEquipo) {
        this.id_equipo = data.id_equipo
        this.id_conductor = data.id_conductor
        this.id_vehiculo = data.id_vehiculo
        this.fecha_asignacion = data.fecha_asignacion
        this.estado = data.estado
        this.conductor = data.conductor
        this.vehiculo = data.vehiculo
        this.ubicacion = data.ubicacion
        this.ruta_activa = data.ruta_activa
    }
}
