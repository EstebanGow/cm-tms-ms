import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import EnvioEntity from '../entities/EnvioEntity'

export interface RutasRepository {
    guardarRutas(data: EnvioEntity[], idEquipo: number): Promise<void>
    guardarRutasReplanificacion(data: EnvioEntity[], idEquipo: number, idOptimizacion: number): Promise<void>
    consultarRutaActivaEquipo(idEquipo: number): Promise<object | null>
    obtenerRutasEquipo(idEquipo: number): Promise<OptimizacionRutaEntity | null>
}
