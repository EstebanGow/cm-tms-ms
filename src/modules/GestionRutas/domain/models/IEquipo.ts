import { IConductor } from './IConductor'
import { IUbicacionGPS } from './IUbicacionGPS'
import { IVehiculo } from './IVehiculo'

export interface IEquipo {
    id_equipo: number
    id_conductor: number
    id_vehiculo: number
    fecha_asignacion: string
    ruta_activa: number
    estado: string
    conductor: IConductor
    vehiculo: IVehiculo
    ubicacion: IUbicacionGPS
}
