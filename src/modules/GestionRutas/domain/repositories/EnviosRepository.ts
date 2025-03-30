import EnvioEntity from '../entities/EnvioEntity'

export interface EnviosRepository {
    consultarEnvios(estado: string, ciudad: string): Promise<EnvioEntity[] | null>
    consultarEnviosOptimizacion(idOprimizacion: number): Promise<EnvioEntity[] | null>
}
