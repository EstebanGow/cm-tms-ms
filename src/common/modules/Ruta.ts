export interface Ruta {
    metodo: HTTPMETODOTYPE
    url: string
    evento: CallableFunction
    handler?: Record<string, unknown>
    schema?: Record<string, unknown>
}

type HTTPMETODOTYPE = 'get' | 'post' | 'put' | 'delete' | 'patch'

export enum HTTPMETODO {
    GET = 'get',
    POST = 'post',
    PUT = 'put',
    DELETE = 'delete',
    PATCH = 'patch',
}
export enum HTTPSTATUSCODE {
    OK = 200,
    INTERNAL = 500,
    UNPROCESSABLE_CONTENT = 422,
    CREATED = 201,
    NO_CONTENT = 204,
}
