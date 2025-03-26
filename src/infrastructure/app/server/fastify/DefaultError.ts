export interface DefaultErrorModel {
    message: string
    isError: boolean
    cause: unknown
    stack?: string
    code: number | string
    statusCode: number
    defaultMessage: string
}
