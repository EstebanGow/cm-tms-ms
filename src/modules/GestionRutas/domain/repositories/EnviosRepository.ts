import EnvioEntity from '../entities/EnvioEntity'

export interface EnviosRepository {
    consultarEnvios(estado: string): Promise<EnvioEntity[] | null>
}
