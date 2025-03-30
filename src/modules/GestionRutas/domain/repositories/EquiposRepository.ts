import EquipoEntity from '../entities/EquipoEntity'

export interface EquiposRepository {
    obtenerEquipoPorId(idEquipo: number): Promise<EquipoEntity | null>
}
