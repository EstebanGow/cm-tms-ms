export interface RedisRepository {
    consultar(data: string): Promise<object | Array<object> | null>
    guardar(data: object, nombre: string): Promise<void>
    obtenerRecurso(data: string): Promise<object | null>
    eliminar(data: string): Promise<void>
}
