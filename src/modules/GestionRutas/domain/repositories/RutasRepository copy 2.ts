export interface RutasRepository {
    guardar(data: object): Promise<object | null>
}
