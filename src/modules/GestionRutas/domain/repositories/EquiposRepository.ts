import OptimizacionRutaEntity from '@modules/Equipos/domain/entities/OptimizacionRutaEntity'
import EquipoEntity from '../entities/EquipoEntity'

export interface EquiposRepository {
    obtenerEquipos(estado: string, disponible?: boolean): Promise<object | null>
    obtenerEquipoPorId(idEquipo: number): Promise<EquipoEntity | null>
    obtenerRutasEquipo(idEquipo: number): Promise<OptimizacionRutaEntity | null>
}
