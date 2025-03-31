import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import EnvioEntity from '../entities/EnvioEntity'

export interface RutasRepository {
    guardarRutas(data: EnvioEntity[], idEquipo: number): Promise<void>
    guardarRutasReplanificacion(
        data: EnvioEntity[],
        idEquipo: number,
        idOptimizacion: number,
        idEvento: number,
    ): Promise<void>
    consultarRutaActivaEquipo(idEquipo: number, ciudad: string): Promise<OptimizacionRutaEntity | null>
    obtenerRutasEquipo(idEquipo: number): Promise<OptimizacionRutaEntity | null>
}
